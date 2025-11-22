import type { QTimeProps } from 'quasar';

interface BaseCalendarProps {

  /**
   * Выбор диапазона дат
   */
  range?: boolean

  /**
   * Только для чтения
   */
  readonly?: boolean

  /**
   * Календарь в состоянии «отключенного»
   */
  disable?: boolean

  /**
   * Формат даты
   */
  mask?: string

  /**
   * Региональные настройки *
   */
  locale?: QTimeProps['locale']

  /**
   * Пропс для ограничения выбора будущих дат
   */
  isDisableFutureDates?: boolean
}

interface CalDate {
  date?: number
  day?: number
  month: number
  year: number
}

interface CalRange {
  from?: string | CalDate
  to?: string | CalDate
}

interface BaseCalendarEmits {
  /**
   *  Выбор даты
   */
  (e: 'update', value: string | CalRange): void
  /**
   *  Изменение месяца/года
   */
  (e: 'navigate', view: CalDate): void
}

export type { BaseCalendarEmits, BaseCalendarProps, CalDate, CalRange };
