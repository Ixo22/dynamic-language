import type { DialogueResponse } from './types'

export interface Situacion {
  id:       string
  label:    string
  jp:       string
  emoji:    string
  accent:   string
  dialogues: DialogueResponse[]
}

export const SITUACIONES: Situacion[] = [
  {
    id: 'supermercado', label: 'Supermercado', jp: 'スーパー', emoji: '🛒', accent: '#4a7c3f',
    dialogues: [
      {
        contexto_escena: 'En la caja del supermercado, preguntas el precio de un producto.',
        frase_completa_jp: 'これはいくらですか？',
        frase_es: '¿Cuánto cuesta esto?',
        vocabulario_desglosado: [
          { forma: 'これ', lectura: 'これ', significado: 'esto' },
          { forma: 'いくら', lectura: 'いくら', significado: '¿cuánto? (precio)' },
          { forma: 'ですか', lectura: 'ですか', significado: '¿es? (pregunta formal)' },
        ],
      },
      {
        contexto_escena: 'En la caja, preguntas si puedes pagar con tarjeta.',
        frase_completa_jp: 'カードで払えますか？',
        frase_es: '¿Puedo pagar con tarjeta?',
        vocabulario_desglosado: [
          { forma: 'カード', lectura: 'カード', significado: 'tarjeta' },
          { forma: 'で', lectura: 'で', significado: 'con / mediante (partícula)' },
          { forma: '払える', lectura: 'はらえる', significado: 'poder pagar (potencial de 払う)' },
        ],
      },
      {
        contexto_escena: 'La cajera te pregunta si necesitas bolsa.',
        frase_completa_jp: '袋はご利用ですか？',
        frase_es: '¿Va a usar bolsa?',
        vocabulario_desglosado: [
          { forma: '袋', lectura: 'ふくろ', significado: 'bolsa' },
          { forma: 'ご利用', lectura: 'ごりよう', significado: 'uso (forma honorífica)' },
        ],
      },
      {
        contexto_escena: 'Buscas una sección del supermercado y preguntas a un empleado.',
        frase_completa_jp: '野菜売り場はどこですか？',
        frase_es: '¿Dónde está la sección de verduras?',
        vocabulario_desglosado: [
          { forma: '野菜', lectura: 'やさい', significado: 'verduras' },
          { forma: '売り場', lectura: 'うりば', significado: 'sección / mostrador de venta' },
          { forma: 'どこ', lectura: 'どこ', significado: 'dónde' },
        ],
      },
      {
        contexto_escena: 'Ves un producto y preguntas si hay descuento.',
        frase_completa_jp: '割引はありますか？',
        frase_es: '¿Hay descuento?',
        vocabulario_desglosado: [
          { forma: '割引', lectura: 'わりびき', significado: 'descuento' },
          { forma: 'あります', lectura: 'あります', significado: 'hay / existe' },
        ],
      },
    ],
  },
  {
    id: 'restaurante', label: 'Restaurante', jp: 'レストラン', emoji: '🍜', accent: '#b85c2a',
    dialogues: [
      {
        contexto_escena: 'Acabas de sentarte y el camarero se acerca.',
        frase_completa_jp: 'メニューを見せてください。',
        frase_es: 'El menú, por favor.',
        vocabulario_desglosado: [
          { forma: 'メニュー', lectura: 'メニュー', significado: 'menú' },
          { forma: '見せて', lectura: 'みせて', significado: 'mostrar (forma て)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor (deme)' },
        ],
      },
      {
        contexto_escena: 'El camarero te pregunta si ya has decidido.',
        frase_completa_jp: 'おすすめは何ですか？',
        frase_es: '¿Qué recomienda?',
        vocabulario_desglosado: [
          { forma: 'おすすめ', lectura: 'おすすめ', significado: 'recomendación / lo más recomendado' },
          { forma: '何', lectura: 'なに', significado: 'qué' },
        ],
      },
      {
        contexto_escena: 'Al pedir, dices que no quieres que esté picante.',
        frase_completa_jp: '辛くしないでください。',
        frase_es: 'No lo ponga picante, por favor.',
        vocabulario_desglosado: [
          { forma: '辛く', lectura: 'からく', significado: 'picante (forma adverbial)' },
          { forma: 'しないで', lectura: 'しないで', significado: 'no hacer (petición negativa)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor' },
        ],
      },
      {
        contexto_escena: 'Al terminar de comer, llamas al camarero para pedir la cuenta.',
        frase_completa_jp: 'お会計をお願いします。',
        frase_es: 'La cuenta, por favor.',
        vocabulario_desglosado: [
          { forma: 'お会計', lectura: 'おかいけい', significado: 'la cuenta' },
          { forma: 'お願いします', lectura: 'おねがいします', significado: 'por favor / se lo pido' },
        ],
      },
      {
        contexto_escena: 'El plato llegó y está delicioso.',
        frase_completa_jp: 'これ、おいしい！',
        frase_es: '¡Esto está delicioso!',
        vocabulario_desglosado: [
          { forma: 'これ', lectura: 'これ', significado: 'esto' },
          { forma: 'おいしい', lectura: 'おいしい', significado: 'delicioso / rico' },
        ],
      },
    ],
  },
  {
    id: 'transporte', label: 'Transporte', jp: '電車・駅', emoji: '🚃', accent: '#2a5b8a',
    dialogues: [
      {
        contexto_escena: 'En la taquilla de la estación, compras un billete.',
        frase_completa_jp: '渋谷まで一枚ください。',
        frase_es: 'Un billete hasta Shibuya, por favor.',
        vocabulario_desglosado: [
          { forma: '渋谷', lectura: 'しぶや', significado: 'Shibuya (barrio de Tokio)' },
          { forma: 'まで', lectura: 'まで', significado: 'hasta (partícula de límite)' },
          { forma: '一枚', lectura: 'いちまい', significado: 'una hoja / un billete (contador)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor (deme)' },
        ],
      },
      {
        contexto_escena: 'Preguntas a qué hora sale el próximo tren.',
        frase_completa_jp: '次の電車は何時ですか？',
        frase_es: '¿A qué hora es el próximo tren?',
        vocabulario_desglosado: [
          { forma: '次', lectura: 'つぎ', significado: 'próximo / siguiente' },
          { forma: '電車', lectura: 'でんしゃ', significado: 'tren eléctrico' },
          { forma: '何時', lectura: 'なんじ', significado: '¿qué hora?' },
        ],
      },
      {
        contexto_escena: 'No sabes si el tren que va a llegar para en tu destino.',
        frase_completa_jp: 'この電車は新宿に止まりますか？',
        frase_es: '¿Este tren para en Shinjuku?',
        vocabulario_desglosado: [
          { forma: 'この電車', lectura: 'このでんしゃ', significado: 'este tren' },
          { forma: '新宿', lectura: 'しんじゅく', significado: 'Shinjuku (barrio de Tokio)' },
          { forma: '止まります', lectura: 'とまります', significado: 'parar / detenerse' },
        ],
      },
      {
        contexto_escena: 'Estás perdido en la estación y preguntas dónde cambiar de línea.',
        frase_completa_jp: '乗り換えはどこですか？',
        frase_es: '¿Dónde hago el trasbordo?',
        vocabulario_desglosado: [
          { forma: '乗り換え', lectura: 'のりかえ', significado: 'trasbordo / cambio de tren' },
          { forma: 'どこ', lectura: 'どこ', significado: 'dónde' },
        ],
      },
      {
        contexto_escena: 'Vas en taxi y le dices al conductor tu destino.',
        frase_completa_jp: '新宿駅までお願いします。',
        frase_es: 'A la estación de Shinjuku, por favor.',
        vocabulario_desglosado: [
          { forma: '新宿駅', lectura: 'しんじゅくえき', significado: 'estación de Shinjuku' },
          { forma: 'まで', lectura: 'まで', significado: 'hasta' },
          { forma: 'お願いします', lectura: 'おねがいします', significado: 'por favor' },
        ],
      },
    ],
  },
  {
    id: 'medico', label: 'Médico', jp: '病院・薬局', emoji: '🏥', accent: '#7a3a8a',
    dialogues: [
      {
        contexto_escena: 'En la consulta, el médico te pregunta dónde te duele.',
        frase_completa_jp: '頭が痛いです。',
        frase_es: 'Me duele la cabeza.',
        vocabulario_desglosado: [
          { forma: '頭', lectura: 'あたま', significado: 'cabeza' },
          { forma: '痛い', lectura: 'いたい', significado: 'doler / dolor' },
        ],
      },
      {
        contexto_escena: 'Le dices al médico que tienes fiebre desde ayer.',
        frase_completa_jp: '昨日から熱があります。',
        frase_es: 'Tengo fiebre desde ayer.',
        vocabulario_desglosado: [
          { forma: '昨日', lectura: 'きのう', significado: 'ayer' },
          { forma: 'から', lectura: 'から', significado: 'desde (partícula temporal)' },
          { forma: '熱', lectura: 'ねつ', significado: 'fiebre / calor' },
          { forma: 'あります', lectura: 'あります', significado: 'tener / haber' },
        ],
      },
      {
        contexto_escena: 'Quieres hacer una cita con el médico.',
        frase_completa_jp: '予約をしたいんですが。',
        frase_es: 'Quisiera hacer una cita.',
        vocabulario_desglosado: [
          { forma: '予約', lectura: 'よやく', significado: 'reserva / cita' },
          { forma: 'したい', lectura: 'したい', significado: 'querer hacer' },
          { forma: 'んですが', lectura: 'んですが', significado: 'es que... (explicación suave)' },
        ],
      },
      {
        contexto_escena: 'En la farmacia, preguntas cómo tomar la medicina.',
        frase_completa_jp: '一日何回飲めばいいですか？',
        frase_es: '¿Cuántas veces al día debo tomarlo?',
        vocabulario_desglosado: [
          { forma: '一日', lectura: 'いちにち', significado: 'un día / al día' },
          { forma: '何回', lectura: 'なんかい', significado: '¿cuántas veces?' },
          { forma: '飲む', lectura: 'のむ', significado: 'beber / tomar (medicina)' },
          { forma: 'ばいい', lectura: 'ばいい', significado: 'debería / está bien si...' },
        ],
      },
    ],
  },
  {
    id: 'cafeteria', label: 'Cafetería', jp: 'カフェ', emoji: '☕', accent: '#7a5c2a',
    dialogues: [
      {
        contexto_escena: 'En el mostrador de un café, haces tu pedido.',
        frase_completa_jp: 'コーヒーを一つください。',
        frase_es: 'Un café, por favor.',
        vocabulario_desglosado: [
          { forma: 'コーヒー', lectura: 'コーヒー', significado: 'café' },
          { forma: '一つ', lectura: 'ひとつ', significado: 'uno (contador general)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor (deme)' },
        ],
      },
      {
        contexto_escena: 'El barista te pregunta si es para aquí o para llevar.',
        frase_completa_jp: '持ち帰りにします。',
        frase_es: 'Para llevar.',
        vocabulario_desglosado: [
          { forma: '持ち帰り', lectura: 'もちかえり', significado: 'para llevar / takeaway' },
          { forma: 'にします', lectura: 'にします', significado: 'lo haré así / me decido por...' },
        ],
      },
      {
        contexto_escena: 'Te instalas a trabajar y necesitas la contraseña del wifi.',
        frase_completa_jp: 'Wifiのパスワードを教えてください。',
        frase_es: 'Dígame la contraseña del wifi, por favor.',
        vocabulario_desglosado: [
          { forma: 'パスワード', lectura: 'パスワード', significado: 'contraseña' },
          { forma: '教えて', lectura: 'おしえて', significado: 'enseñar / decir (forma て)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor' },
        ],
      },
      {
        contexto_escena: 'Le pides al barista que no le ponga azúcar.',
        frase_completa_jp: '砂糖は入れないでください。',
        frase_es: 'Sin azúcar, por favor.',
        vocabulario_desglosado: [
          { forma: '砂糖', lectura: 'さとう', significado: 'azúcar' },
          { forma: '入れないで', lectura: 'いれないで', significado: 'no poner / no meter' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor' },
        ],
      },
    ],
  },
  {
    id: 'trabajo', label: 'Trabajo', jp: '会社・仕事', emoji: '🏢', accent: '#3a5a7a',
    dialogues: [
      {
        contexto_escena: 'Llegarás tarde y lo avisas al llegar.',
        frase_completa_jp: '少し遅刻します。すみません。',
        frase_es: 'Voy a llegar un poco tarde. Disculpe.',
        vocabulario_desglosado: [
          { forma: '少し', lectura: 'すこし', significado: 'un poco' },
          { forma: '遅刻', lectura: 'ちこく', significado: 'llegar tarde' },
          { forma: 'します', lectura: 'します', significado: 'hacer (formal)' },
          { forma: 'すみません', lectura: 'すみません', significado: 'disculpe / lo siento' },
        ],
      },
      {
        contexto_escena: 'Preguntas a un compañero a qué hora empieza la reunión.',
        frase_completa_jp: '会議は何時から始まりますか？',
        frase_es: '¿A qué hora empieza la reunión?',
        vocabulario_desglosado: [
          { forma: '会議', lectura: 'かいぎ', significado: 'reunión' },
          { forma: '何時', lectura: 'なんじ', significado: '¿qué hora?' },
          { forma: 'から', lectura: 'から', significado: 'desde / a partir de' },
          { forma: '始まります', lectura: 'はじまります', significado: 'comenzar / empezar' },
        ],
      },
      {
        contexto_escena: 'Al salir de la oficina, te despides del equipo.',
        frase_completa_jp: 'お疲れ様でした。',
        frase_es: 'Buen trabajo. Hasta mañana. (despedida al salir)',
        vocabulario_desglosado: [
          { forma: 'お疲れ様', lectura: 'おつかれさま', significado: 'gracias por el esfuerzo / buen trabajo' },
          { forma: 'でした', lectura: 'でした', significado: 'fue / era (pasado formal)' },
        ],
      },
      {
        contexto_escena: 'Le pides un favor a un compañero con cortesía.',
        frase_completa_jp: 'このファイルを送ってもらえますか？',
        frase_es: '¿Podría enviarme este archivo?',
        vocabulario_desglosado: [
          { forma: 'ファイル', lectura: 'ファイル', significado: 'archivo' },
          { forma: '送って', lectura: 'おくって', significado: 'enviar (forma て)' },
          { forma: 'もらえます', lectura: 'もらえます', significado: '¿podría... para mí? (favor educado)' },
        ],
      },
    ],
  },
  {
    id: 'casa', label: 'En casa', jp: '家・日常', emoji: '🏠', accent: '#6a4a2a',
    dialogues: [
      {
        contexto_escena: 'La cena está lista y llamas a tu familia.',
        frase_completa_jp: 'ご飯できたよ！',
        frase_es: '¡La comida está lista!',
        vocabulario_desglosado: [
          { forma: 'ご飯', lectura: 'ごはん', significado: 'arroz / comida' },
          { forma: 'できた', lectura: 'できた', significado: 'estar listo / terminado' },
        ],
      },
      {
        contexto_escena: 'Le pides a alguien que apague la luz al salir.',
        frase_completa_jp: '電気を消してください。',
        frase_es: 'Apaga la luz, por favor.',
        vocabulario_desglosado: [
          { forma: '電気', lectura: 'でんき', significado: 'electricidad / luz' },
          { forma: '消して', lectura: 'けして', significado: 'apagar (forma て)' },
          { forma: 'ください', lectura: 'ください', significado: 'por favor' },
        ],
      },
      {
        contexto_escena: 'Le preguntas a tu compañero de piso quién limpia hoy.',
        frase_completa_jp: '今日、誰が掃除する？',
        frase_es: '¿Quién limpia hoy?',
        vocabulario_desglosado: [
          { forma: '今日', lectura: 'きょう', significado: 'hoy' },
          { forma: '誰が', lectura: 'だれが', significado: 'quién (sujeto)' },
          { forma: '掃除する', lectura: 'そうじする', significado: 'limpiar / hacer limpieza' },
        ],
      },
      {
        contexto_escena: 'Le preguntas a un familiar si ya se ha duchado.',
        frase_completa_jp: 'もうお風呂に入った？',
        frase_es: '¿Ya te duchaste?',
        vocabulario_desglosado: [
          { forma: 'もう', lectura: 'もう', significado: 'ya' },
          { forma: 'お風呂', lectura: 'おふろ', significado: 'baño / bañera' },
          { forma: '入った', lectura: 'はいった', significado: 'entrar / meterse (pasado)' },
        ],
      },
    ],
  },
  {
    id: 'tienda', label: 'Tienda de ropa', jp: '服屋・ショップ', emoji: '👗', accent: '#8a3a5a',
    dialogues: [
      {
        contexto_escena: 'Le preguntas al dependiente si tienen tu talla.',
        frase_completa_jp: 'Mサイズはありますか？',
        frase_es: '¿Tiene talla M?',
        vocabulario_desglosado: [
          { forma: 'Mサイズ', lectura: 'エムサイズ', significado: 'talla M' },
          { forma: 'あります', lectura: 'あります', significado: 'hay / tienen' },
        ],
      },
      {
        contexto_escena: 'Quieres probarte una prenda antes de comprarla.',
        frase_completa_jp: '試着してもいいですか？',
        frase_es: '¿Puedo probármelo?',
        vocabulario_desglosado: [
          { forma: '試着', lectura: 'しちゃく', significado: 'probarse ropa' },
          { forma: 'してもいい', lectura: 'してもいい', significado: '¿está bien si...? / ¿puedo...?' },
        ],
      },
      {
        contexto_escena: 'Te gusta el modelo pero no el color, buscas otra opción.',
        frase_completa_jp: '別の色はありますか？',
        frase_es: '¿Hay otro color?',
        vocabulario_desglosado: [
          { forma: '別の', lectura: 'べつの', significado: 'otro / diferente' },
          { forma: '色', lectura: 'いろ', significado: 'color' },
          { forma: 'あります', lectura: 'あります', significado: 'hay / tienen' },
        ],
      },
      {
        contexto_escena: 'Te has probado algo y le dices al dependiente que es grande.',
        frase_completa_jp: 'ちょっと大きいです。',
        frase_es: 'Es un poco grande.',
        vocabulario_desglosado: [
          { forma: 'ちょっと', lectura: 'ちょっと', significado: 'un poco' },
          { forma: '大きい', lectura: 'おおきい', significado: 'grande' },
        ],
      },
    ],
  },
]

export function getSituacion(id: string): Situacion | undefined {
  return SITUACIONES.find(s => s.id === id)
}
