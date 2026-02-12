import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

// Implementación manual de decode/encode siguiendo guías
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiLiveClient {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private onVolumeChange: (vol: number) => void;
  private onCloseCallback: () => void;
  private isConnectedState = false;

  constructor(onVolumeChange: (vol: number) => void, onCloseCallback: () => void) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    // Inicialización mandatoria según reglas del SDK
    this.ai = new GoogleGenAI({ apiKey });
    this.onVolumeChange = onVolumeChange;
    this.onCloseCallback = onCloseCallback;
  }

  async connect() {
    if (this.isConnectedState) return;

    try {
      // 1. Solicitar micrófono primero para validar permisos locales
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("Error de acceso al micrófono:", err);
        throw new Error("No se pudo acceder al micrófono. Por favor, permite el acceso en tu navegador.");
      }

      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      const outputNode = this.outputAudioContext.createGain();
      outputNode.connect(this.outputAudioContext.destination);

      this.isConnectedState = true;

      // 2. Conectar a la Live API
      this.sessionPromise = this.ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: 'Eres "Sofia", experta en IA de Innova-IA. Habla con acento Paisa marcado. Sé amable y profesional.',
        },
        callbacks: {
          onopen: () => {
            console.log("Conexión Live API abierta exitosamente");
            this.startAudioInput(stream);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && this.outputAudioContext) {
              const audioData = decode(base64Audio);

              // Visualización de volumen
              let sum = 0;
              for (let i = 0; i < audioData.length; i += 100) sum += Math.abs(audioData[i] - 128);
              this.onVolumeChange(Math.min(100, sum / 10));

              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              try {
                const audioBuffer = await decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
                const source = this.outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.start(this.nextStartTime);
                this.nextStartTime += audioBuffer.duration;

                source.onended = () => {
                  this.sources.delete(source);
                  if (this.sources.size === 0) this.onVolumeChange(0);
                };
                this.sources.add(source);
              } catch (e) {
                console.error("Error decodificando audio:", e);
              }
            }

            if (message.serverContent?.interrupted) {
              this.sources.forEach(s => { try { s.stop(); } catch (e) { } });
              this.sources.clear();
              this.nextStartTime = 0;
            }
          },
          onclose: () => {
            console.log("Sesión cerrada");
            this.disconnect();
          },
          onerror: (e) => {
            console.error("Error en Live API:", e);
            this.disconnect();
          }
        }
      });

      await this.sessionPromise;

    } catch (error) {
      console.error("Fallo en la conexión:", error);
      this.disconnect();
      throw error;
    }
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext || !this.sessionPromise) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isConnectedState) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Visualización de volumen de entrada
      let sum = 0;
      for (let i = 0; i < inputData.length; i += 50) sum += Math.abs(inputData[i]);
      const vol = Math.min(100, (sum / (inputData.length / 50)) * 500);
      this.onVolumeChange(vol);

      // Conversión a PCM 16-bit para la API
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      const base64Data = encode(new Uint8Array(int16.buffer));

      // Enviar entrada solo después de que la promesa de la sesión se resuelva
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Data
          }
        });
      }).catch(err => console.error("Error enviando audio:", err));
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  disconnect() {
    this.isConnectedState = false;
    this.onCloseCallback();

    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) { }
      this.processor = null;
    }
    if (this.inputSource) {
      try { this.inputSource.disconnect(); } catch (e) { }
      this.inputSource = null;
    }

    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      try { this.inputAudioContext.close(); } catch (e) { }
    }
    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      try { this.outputAudioContext.close(); } catch (e) { }
    }

    this.sources.forEach(s => { try { s.stop(); } catch (e) { } });
    this.sources.clear();
    this.nextStartTime = 0;
  }
}