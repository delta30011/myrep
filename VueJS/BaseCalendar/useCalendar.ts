import type { QDate, QTimeProps } from 'quasar';
import { format } from 'quasar';
import type { ShallowRef } from 'vue';
import { computed, getCurrentInstance, onMounted, onUpdated, ref, useTemplateRef } from 'vue';
import type { BaseCalendarEmits, CalDate, CalRange } from './BaseCalendar.interface';

export function useCalendar(
  modelValue: ShallowRef<string | CalRange | null>,
  mask: string | null,
  range: boolean | string | null,
  locale: QTimeProps['locale'],
  emit: BaseCalendarEmits,
  isDisableFutureDates: boolean,
) {
  let date: Date;

  if (modelValue.value) {
    const value = modelValue.value;
    date = new Date(unmaskValue(((typeof value === 'string')
      ? value
      : value.from) as string)
      .split('.')
      .reverse()
      .join('.'));
  } else {
    date = new Date();
  }

  const activeDate = ref<CalDate>({
    day: 1,
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const activeRange = ref<CalRange>({});
  const rangeProcessing = ref<boolean>(false);
  const instance = getCurrentInstance();
  const calendar = useTemplateRef<QDate>('cal');
  const rangeCalendar1 = useTemplateRef<QDate>('cal1');
  const rangeCalendar2 = useTemplateRef<QDate>('cal2');

  const range1 = ref<boolean>(true);
  const range2 = ref<boolean>(true);

  const defaultDate1 = ref<string>([
    activeDate.value.year,
    format.pad(`${activeDate.value.month}`, 2),
  ].join('/'));

  const isDecember = (activeDate.value.month > 11);
  const defaultDate2 = ref<string>([
    activeDate.value.year + ((isDecember) ? 1 : 0),
    format.pad((isDecember ? '1' : `${activeDate.value.month}`), 2),
  ].join('/'));

  const view = ref(0);
  const views: Parameters<QDate['setView']>[0][] = ['Calendar', 'Months', 'Years'];

  const noEffect = ref<boolean>(false);

  function maskValue(date: CalDate) {
    return mask
      .replace('DD', format.pad(`${date.day}`, 2))
      .replace('MM', format.pad(`${date.month}`, 2))
      .replace('YYYY', `${date.year}`);
  }

  // returns date string in internal format
  function unmaskValue(date: string) {
    return Object
      .entries({ day: 'DD', month: 'MM', year: 'YYYY' })
      .map((pair) => {
        const v = pair[1];
        const pos = mask.indexOf(v);
        return date.substring(pos, pos + v.length);
      })
      .join('.');
  }

  function updateCal(value: string | CalRange) {
    view.value = 0;
    emit('update', value);
  }

  function updateCalRange(value: string | CalRange) {
    const fromSrc = activeRange.value.from as CalDate;

    rangeCalendar1.value.setEditingRange(null, null);
    rangeCalendar2.value.setEditingRange(null, null);

    if (rangeProcessing.value && fromSrc && typeof value === 'string') {
      let from;
      let to;
      const _toYMD = v => Number(v.split('.').reverse().join(''));

      // Compare dates
      if (_toYMD(unmaskValue(value)) < Number(
        `${fromSrc.year}${format.pad(`${fromSrc.month}`, 2)}${format.pad(`${fromSrc.day}`, 2)}`,
      )) {
        from = value;
        to = maskValue(fromSrc);
      } else {
        from = maskValue(fromSrc);
        to = value;
      }

      modelValue.value = {
        from,
        to,
      };

      instance.proxy.$nextTick(() => {
        instance.proxy.$forceUpdate();
      });
    } else {
      value && instance.proxy.$nextTick(() => {
        instance.proxy.$forceUpdate();
      });
    }

    range1.value = range2.value = true;
    rangeProcessing.value = false;
    activeRange.value.from = null;

    updateCal(value);
  }

  function navigateCal({ ...opts }: CalDate) {
    const view = { ...opts };
    if (view.month < 1) {
      view.year--;
      view.month = 12 - view.month;
    } else if (view.month > 12) {
      view.year++;
      view.month = view.month - 12;
    }
    activeDate.value = view;
    emit('navigate', view);
  }

  function rangeStart(date: CalDate) {
    modelValue.value = null;
    if (!activeRange.value.from) {
      activeRange.value.from = date;
    }
    rangeProcessing.value = true;
    noEffect.value = true;
  }

  function rangeEnd() {
    rangeProcessing.value = false;
  }

  function rangeStart1(date: CalDate) {
    range2.value = false;
    rangeStart(date);
  }

  function rangeStart2(date: CalDate) {
    range1.value = false;
    rangeStart(date);
  }

  function setView(v: number) {
    (range ? rangeCalendar1 : calendar).value?.setView(views[v]);
    view.value = v;
  }

  function watchView() {
    const cal = (range) ? rangeCalendar1 : calendar;
    if (cal.value?.$el.querySelector('.q-date__months,.q-date__years')) {
      setTimeout(() => {
        cal.value?.$el.querySelector('.q-date__calendar') && setView(0);
      }, 100);
    }
  }

  function offsetYears(asc: boolean) {
    const cal = (range) ? rangeCalendar1 : calendar;
    cal.value?.setCalendarTo(
      activeDate.value.year + (asc ? 11 : -11),
      (activeDate.value.month || 1),
    );
    setView(2);
  }

  function offsetRange(period: 'month' | 'year', asc: boolean) {
    rangeCalendar1.value.offsetCalendar(period, asc);
    noEffect.value = false;
  }

  const calendarTitle = computed(() => (view.value
    ? activeDate.value.year
    : `${locale.months[activeDate.value.month - 1]} ${activeDate.value.year}`),
  );

  const period = computed(() => {
    const start = Math.floor(activeDate.value.year / 10) * 10;
    return [start, start + 11].join('-');
  });

  const rangeCalendar1Title = computed(() =>
    (`${locale.months[activeDate.value.month - 1]} ${activeDate.value.year}`));
  const rangeCalendar2Title = computed(() =>
    (`${locale.months[activeDate.value.month > 11
      ? 0
      : activeDate.value.month]} ${activeDate.value.year + (activeDate.value.month > 11 ? 1 : 0)}`),
  );

  function isDateAfterToday(isDisableFutureDates: boolean | undefined) {
    return (date: string) => {
      const currentDate = new Date();
      const selectedDate = new Date(date);

      if (!isDisableFutureDates) {
        return false;
      }

      return selectedDate < currentDate;
    };
  }

  const disableFutureDates = computed(() => {
    return isDisableFutureDates
      ? isDateAfterToday(isDisableFutureDates)
      : undefined;
  });

  onUpdated(() => {
    if (range) {
      const newDate = [activeDate.value.year, activeDate.value.month + 1];
      if (newDate[1] > 12) {
        newDate[0]++;
        newDate[1] = 1;
      }
      rangeCalendar2?.value?.setCalendarTo(newDate[0], newDate[1]);
      defaultDate1.value = `${activeDate.value.year}/${(`00${activeDate.value.month}`).slice(-2)}`;
      defaultDate2.value = `${newDate[0]}/${(`00${newDate[1]}`).slice(-2)}`;
    }
  });

  onMounted(() => {
    if (range && modelValue.value) {
      const newDate = [activeDate.value.year, activeDate.value.month + 1];
      noEffect.value = true;
      rangeCalendar2?.value?.setCalendarTo(newDate[0], newDate[1]);
    }
  });

  return {
    date,
    activeDate,
    activeRange,
    rangeProcessing,
    instance,
    calendar,
    rangeCalendar1,
    rangeCalendar2,
    range1,
    range2,
    defaultDate1,
    defaultDate2,
    view,
    noEffect,
    calendarTitle,
    period,
    rangeCalendar1Title,
    rangeCalendar2Title,
    updateCal,
    updateCalRange,
    navigateCal,
    rangeEnd,
    rangeStart1,
    rangeStart2,
    setView,
    watchView,
    offsetYears,
    offsetRange,
    maskValue,
    unmaskValue,
    disableFutureDates,
  };
}
