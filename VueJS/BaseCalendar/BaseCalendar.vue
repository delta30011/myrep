<script setup lang="ts">
import { useCalendar } from '@components/BaseCalendar/useCalendar';
import BaseIcon from '@components/BaseIcon/BaseIcon.vue';
import { QDate } from 'quasar';
import { useSafeI18N } from '@/composables/safeI18n';
import type { BaseCalendarEmits, BaseCalendarProps, CalRange } from './BaseCalendar.interface';

const {
  disable,
  readonly,
  range,
  locale: propLocale,
  mask = 'DD.MM.YYYY',
  isDisableFutureDates,
} = defineProps<BaseCalendarProps>();
const emit = defineEmits<BaseCalendarEmits>();
const { t } = useSafeI18N();
const locale = propLocale || {
  months: [
    t('ui-kit.months.january'),
    t('ui-kit.months.february'),
    t('ui-kit.months.march'),
    t('ui-kit.months.april'),
    t('ui-kit.months.may'),
    t('ui-kit.months.june'),
    t('ui-kit.months.july'),
    t('ui-kit.months.august'),
    t('ui-kit.months.september'),
    t('ui-kit.months.october'),
    t('ui-kit.months.november'),
    t('ui-kit.months.december'),
  ],
  daysShort: [
    t('ui-kit.daysShort.sun'),
    t('ui-kit.daysShort.mon'),
    t('ui-kit.daysShort.tue'),
    t('ui-kit.daysShort.wed'),
    t('ui-kit.daysShort.thu'),
    t('ui-kit.daysShort.fri'),
    t('ui-kit.daysShort.sat'),
  ],
  monthsShort: [
    t('ui-kit.monthsShort.jan'),
    t('ui-kit.monthsShort.feb'),
    t('ui-kit.monthsShort.mar'),
    t('ui-kit.monthsShort.apr'),
    t('ui-kit.monthsShort.may'),
    t('ui-kit.monthsShort.jun'),
    t('ui-kit.monthsShort.jul'),
    t('ui-kit.monthsShort.aug'),
    t('ui-kit.monthsShort.sep'),
    t('ui-kit.monthsShort.oct'),
    t('ui-kit.monthsShort.nov'),
    t('ui-kit.monthsShort.dec'),
  ],
};

const modelValue = defineModel<string | CalRange | null>();

const {
  rangeProcessing,
  calendar,
  rangeCalendar1,
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
  disableFutureDates,
} = useCalendar(modelValue, mask, range, locale, emit, isDisableFutureDates);
</script>

<template>
  <div>
    <div
      v-if="!range"
      class="baseCalendar__container"
    >
      <div
        v-if="calendar"
        class="baseCalendar__hdr"
      >
        <slot v-if="view === 0">
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('year', true)"
          />
          <BaseIcon
            icon="chevrons-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('month', true)"
          />
          <span
            class="_title"
            @click="setView(1)"
          >{{ calendarTitle }}</span>
          <BaseIcon
            icon="chevrons-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('month', false)"
          />
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('year', false)"
          />
        </slot>
        <slot v-else-if="view === 1">
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('year', true)"
          />
          <span
            class="_title"
            @click="setView(2)"
          >{{ calendarTitle }}</span>
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="calendar.offsetCalendar('year', false)"
          />
        </slot>
        <slot v-else>
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="offsetYears(false)"
          />
          <span class="_title">{{ period }}</span>
          <BaseIcon
            icon="chevron-left"
            class="chevron-icon"
            @click="offsetYears(true)"
          />
        </slot>
      </div>
      <QDate
        ref="cal"
        v-model="modelValue"
        minimal
        first-day-of-week="1"
        :disable="disable"
        :readonly="readonly"
        :mask="mask"
        :locale="locale"
        :options="disableFutureDates"
        @navigation="navigateCal"
        @update:model-value="updateCal"
        @click="watchView"
      />
    </div>

    <div
      v-else
      class="baseCalendar__container"
      :class="{ _processing: rangeProcessing, _dayView: (view < 1) }"
    >
      <div style="display: flex;">
        <div class="cal-holder">
          <div class="baseCalendar__hdr">
            <slot v-if="view < 1">
              <BaseIcon
                icon="chevron-left"
                @click="offsetRange('year', true)"
              />
              <BaseIcon
                icon="chevrons-left"
                @click="offsetRange('month', true)"
              />
              <span
                class="_title"
                @click="setView(1)"
              >{{ rangeCalendar1Title }}</span>
            </slot>
            <slot v-else-if="view === 1">
              <BaseIcon
                icon="chevron-left"
                @click="rangeCalendar1.offsetCalendar('year', true)"
              />
              <span
                class="_title"
                @click="setView(2)"
              >{{ calendarTitle }}</span>
              <BaseIcon
                icon="chevron-left"
                @click="rangeCalendar1.offsetCalendar('year', false)"
              />
            </slot>
            <slot v-else>
              <BaseIcon
                icon="chevron-left"
                @click="offsetYears(false)"
              />
              <span class="_title">{{ period }}</span>
              <BaseIcon
                icon="chevron-left"
                @click="offsetYears(true)"
              />
            </slot>
          </div>
          <QDate
            ref="cal1"
            v-model="modelValue"
            class="cal_from"
            :class="[(range1 ? 'isRange' : 'isTo')]"
            minimal
            first-day-of-week="1"
            :disable="disable"
            :readonly="readonly"
            :range="range1"
            :mask="mask"
            :locale="locale"
            :default-year-month="defaultDate1"
            @navigation="navigateCal"
            @update:model-value="updateCalRange"
            @range-start="rangeStart1"
            @range-end="rangeEnd"
            @click="watchView"
          />
        </div>
        <div
          v-if="view === 0"
          class="divider"
        />
        <div
          v-if="view < 1"
          class="cal-holder"
        >
          <div class="baseCalendar__hdr">
            <span
              class="_title"
              @click="setView(1)"
            >{{ rangeCalendar2Title }}</span>
            <BaseIcon
              icon="chevrons-left"
              @click="offsetRange('month', false)"
            />
            <BaseIcon
              icon="chevron-left"
              @click="offsetRange('year', false)"
            />
          </div>
          <QDate
            ref="cal2"
            v-model="modelValue"
            class="cal_to"
            :class="[(range2 ? 'isRange' : 'isTo'), (noEffect ? 'no-effect' : '')]"
            minimal
            first-day-of-week="1"
            :disable="disable"
            :readonly="readonly"
            :range="range2"
            :mask="mask"
            :locale="locale"
            :default-year-month="defaultDate2"
            @update:model-value="updateCalRange"
            @range-start="rangeStart2"
            @range-end="rangeEnd"
            @click="watchView"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "./BaseCalendar-vars";
@import "../BaseButton/BaseButton-vars";
@import "@/styles/scss/shadows-variables.light";

.baseCalendar__container {
  width: 360px;
  padding: $calendar-padding-vertical $calendar-padding-horizontal;
  border-radius: $calendar-radius;

  background: $calendar-color-surface;
  box-shadow:
    $shadow-elevation2-level2-position-horizontal
    $shadow-elevation2-level2-position-vertical
    $shadow-elevation2-level2-blur
    $shadow-elevation2-level2-spread
    $shadow-elevation2-level2-color,
    $shadow-elevation2-level1-position-horizontal
    $shadow-elevation2-level1-position-vertical
    $shadow-elevation2-level1-blur
    $shadow-elevation2-level1-spread
    $shadow-elevation2-level1-color;

  &._dayView { width: 720px; }

  .divider {
    flex-grow: 0;
    width: $calendar-devider-width;
    margin: 0 $calendar-gap-horizontal;
    background: $calendar-devider-color-surface;
  }

  .cal-holder { width: 100%; }

  .q-date__calendar-days-container {
    height: auto;
  }

  .no-effect {
    //Hide qDate slide effect
    .q-transition--slide-left-enter-active {
      position: relative !important;
      left: 0 !important;
      transform: none !important;
      transition: none !important;
    }

    .q-transition--slide-left-leave-active {
      display: none !important;
    }
  }
}

.q-date {
  width: auto;
  border: 0;
  background: none;
  box-shadow: none;
}

.q-date__navigation {
  display: none;
}

.q-date__view {
  /* min-height: 132px; */
  padding: 0;
}

.q-date__months {
  min-height: 0;
}

.q-date .q-focus-helper {
  border-radius: $calendar-item-range-label-radius !important;
}

.q-date__content .q-btn {
  width: 100%;
  min-height: 44px;

  &:hover .q-focus-helper {
    opacity: 1 !important;
    background: $calendar-item-basic-hover-surface !important;

    &::before,
    &::after {
      content: none;
    }
  }
}

.q-date__calendar-item,
.q-date__months-item,
.q-date__years-item {
  font-size: $font-body-s-size;
  font-weight: $font-body-s-weight;
  font-style: normal;
  color: $calendar-item-basic-default-label;
}

.q-date__years-item,
.q-date__months-item {
  flex: 0 0 25%;
  padding: 0 1px;

  .bg-primary {
    border: 0;
    color: $calendar-item-basic-active-label !important;
    background-color: $calendar-item-basic-active-surface !important;
    box-shadow: none;

    &:hover {
      color: $calendar-item-basic-hover-label !important;
      background-color: $calendar-item-basic-hover-surface !important;
    }
  }
}

.q-date__calendar-weekdays > div {
  font-size: $font-body-s-size;
  opacity: 1;
}

.q-date .q-date__calendar-item {
  min-width: $calendar-item-width-min;
  height: $calendar-item-height !important;

  > div,
  button {
    border-radius: $calendar-item-range-label-radius;
  }

  &:not(.q-date__range-from, .q-date__range-to) .bg-primary {
    border: 0;
    color: $calendar-item-basic-active-label !important;
    background-color: $calendar-item-basic-active-surface !important;
    box-shadow: none;

    &:hover {
      color: $calendar-item-basic-hover-label !important;
      background-color: $calendar-item-basic-hover-surface !important;
    }
  }
}

.q-date__range::before,
.q-date__range-from ~ .q-date__calendar-item::before {
  opacity: 1;
  background: $calendar-item-range-middle-surface;
}

.q-date__range .q-btn,
.q-date__edit-range .q-btn,
.q-date__range .q-btn.text-white,
.cal_from .q-date__edit-range-to .q-btn {
  color: $calendar-item-range-middle-label !important;
}

.q-date__range-from,
.cal_from.isRange .q-date__edit-range-from,
.q-date:hover .q-date__edit-range-from,
.q-date__edit-range-from-to {
  border-radius: $calendar-item-radius 0 0 $calendar-item-radius;

  &::before {
    content: "";

    position: absolute;
    inset: 1px 0;

    border: solid $calendar-item-range-start-end-border;
    border-width: 0 0 0 $calendar-item-range-border-width;
    border-radius: $calendar-item-radius 0 0 $calendar-item-radius;

    opacity: 1;
    background: $calendar-item-range-start-end-surface;
  }

  .q-btn {
    width: 24px;
    min-width: 0;
    height: 24px;
    min-height: 24px;
    margin: 10px;
    padding: 0;

    color: $calendar-item-range-start-end-label !important;

    background: $calendar-item-range-label-color-surface !important;

    &:hover .q-focus-helper {
      opacity: 0 !important;
    }
  }
}

.q-date__range-to,
.q-date:hover .q-date__edit-range-to,
.q-date.cal_to .q-date__edit-range-to,
._processing .cal_from.isTo .q-date__calendar-item--in:hover,
._processing .cal_to.isTo .q-date__calendar-item--in:hover {
  border-radius: 0 $calendar-item-radius $calendar-item-radius 0;

  &::before {
    content: "";

    position: absolute;
    inset: 1px 0;

    border: $calendar-item-range-start-end-border solid;
    border-width: 0 $calendar-item-range-border-width 0 0;
    border-radius: 0 $calendar-item-radius $calendar-item-radius 0;

    opacity: 1;
    background: $calendar-item-range-start-end-surface;
  }

  .q-btn {
    width: 24px;
    min-width: 0;
    height: 24px;
    min-height: 24px;
    margin: 10px;
    padding: 0;

    color: $calendar-item-range-start-end-label !important;

    background: $calendar-item-range-label-color-surface !important;

    &:hover .q-focus-helper {
      opacity: 0 !important;
    }
  }
}

._processing .cal_from.isTo .q-date__calendar-item--in:hover::before {
  border-right: 0 !important;
  border-left: 1.5px solid #3662ff;
  border-radius: $calendar-item-radius 0 0 $calendar-item-radius;
}

.q-date__edit-range::before,
._processing .cal_from.isRange .q-date__edit-range-from ~ .q-date__calendar-item::before,
._processing .cal_from.isTo:hover .q-date__calendar-days .q-date__calendar-item:hover ~ .q-date__calendar-item::before,
._processing .cal_to.isRange .q-date__calendar-days .q-date__calendar-item::before,
._processing .cal_to.isTo:hover .q-date__calendar-days .q-date__calendar-item::before {
  content: "";

  position: absolute;
  inset: 1px 0;

  opacity: 1;
  background: $calendar-item-range-middle-surface;
}

._processing .cal_to.isRange:hover .q-date__calendar-days .q-date__calendar-item::before {
  content: none;
}

._processing .cal_to.isRange:hover .q-date__calendar-days .q-date__edit-range,
._processing .cal_to.isRange:hover .q-date__calendar-days .q-date__edit-range-from,
._processing .cal_to.isRange:hover .q-date__calendar-days .q-date__edit-range-from-to,
._processing .cal_to.isRange:hover .q-date__calendar-days .q-date__edit-range-to {
  &::before {
    content: "";
  }
}

._processing .cal_from.isRange:hover .q-date__edit-range-to ~ .q-date__calendar-item::before,
._processing .cal_to.isTo:hover .q-date__calendar-days .q-date__calendar-item:hover ~ .q-date__calendar-item::before,
._processing .cal_to.isRange .q-date__edit-range-to ~ .q-date__calendar-item::before,
._processing .cal_to.isRange .q-date__edit-range-from-to ~ .q-date__calendar-item::before {
  background: transparent !important;
}

._processing {
  .q-btn.text-primary {
    color: $calendar-item-range-middle-label !important;
  }
}

.q-date__edit-range-to::after,
.q-date__edit-range-from::after,
.q-date__edit-range-from-to::after,
.q-date__edit-range::after {
  border-color: transparent !important;
}

.baseCalendar__hdr {
  display: flex;
  align-items: center;
  align-self: stretch;
  justify-content: space-between;

  height: 32px;
  padding: 0 $calendar-header-padding-horizontal;

  color: $button-transparent-default-color-label;

  svg {
    cursor: pointer;
  }

  ._title {
    cursor: pointer;

    display: block;
    flex-grow: 1;

    font: normal $font-button-s-weight $font-button-s-size $font-button-family;
    text-align: center;

    &::first-letter {
      text-transform: uppercase;
    }

    ~ svg {
      transform: rotate(180deg);
    }
  }
}

.q-date__years .col-auto {
  display: none;
}

.chevron-icon {
  width: $calendar-control-icon-size;
  height: $calendar-control-icon-size;
}
</style>
