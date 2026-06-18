import { DialogueResponse } from './types'

export const DEMO_DIALOGUES: DialogueResponse[] = [
  {
    contexto_escena: 'Llegando a la oficina por la mañana',
    frase_completa_jp: '今日もよろしくお願いします。',
    frase_es: 'Gracias por trabajar conmigo hoy también.',
    vocabulario_desglosado: [
      { forma: '今日', lectura: 'きょう', significado: 'hoy' },
      { forma: 'お願い', lectura: 'おねがい', significado: 'petición / por favor' },
    ],
  },
  {
    contexto_escena: 'Pidiendo algo en una tienda',
    frase_completa_jp: 'すみません、これをひとつください。',
    frase_es: 'Disculpe, deme uno de esto, por favor.',
    vocabulario_desglosado: [
      { forma: 'すみません', lectura: 'すみません', significado: 'disculpe / perdón' },
      { forma: 'これ', lectura: 'これ', significado: 'esto (cerca del hablante)' },
      { forma: 'ひとつ', lectura: 'ひとつ', significado: 'uno (contador general)' },
      { forma: 'ください', lectura: 'ください', significado: 'por favor (deme)' },
    ],
  },
  {
    contexto_escena: 'Preguntando cómo llegar a la estación',
    frase_completa_jp: '駅はどこですか？',
    frase_es: '¿Dónde está la estación?',
    vocabulario_desglosado: [
      { forma: '駅', lectura: 'えき', significado: 'estación de tren' },
      { forma: 'どこ', lectura: 'どこ', significado: 'dónde' },
    ],
  },
  {
    contexto_escena: 'Comentando la comida en un restaurante',
    frase_completa_jp: 'このラーメンはとても美味しいですね！',
    frase_es: '¡Este ramen está buenísimo, ¿verdad?!',
    vocabulario_desglosado: [
      { forma: 'ラーメン', lectura: 'ラーメン', significado: 'ramen (fideos japoneses)' },
      { forma: '美味しい', lectura: 'おいしい', significado: 'delicioso / rico' },
    ],
  },
  {
    contexto_escena: 'Hablando del tiempo con un compañero',
    frase_completa_jp: '今日の天気はどうですか？',
    frase_es: '¿Qué tal está el tiempo hoy?',
    vocabulario_desglosado: [
      { forma: '今日', lectura: 'きょう', significado: 'hoy' },
      { forma: '天気', lectura: 'てんき', significado: 'tiempo / clima' },
    ],
  },
  {
    contexto_escena: 'Expresando tu motivación para estudiar',
    frase_completa_jp: '日本語をもっと勉強したいです。',
    frase_es: 'Quiero estudiar japonés más.',
    vocabulario_desglosado: [
      { forma: '日本語', lectura: 'にほんご', significado: 'idioma japonés' },
      { forma: '勉強', lectura: 'べんきょう', significado: 'estudio / estudiar' },
      { forma: 'したい', lectura: 'したい', significado: 'quiero hacer (deseo)' },
    ],
  },
]
