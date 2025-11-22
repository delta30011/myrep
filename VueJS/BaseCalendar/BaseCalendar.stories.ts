import type { StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import BaseCalendar from './BaseCalendar.vue';

const meta = {
  title: 'Components/Calendar',
  component: BaseCalendar,
  tags: ['todo'],
  argTypes: {
    range: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: `**test**
          - компонент "Календарь";

        **Props**:
- \`readonly;\`: только для чтения
          - \`disabled;\`: отключение
          - \`range;\`: выбор диапазона дат
          `,
      },
    },
  },
}/* satisfies Meta<typeof BaseCalendar> */;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    range: false,
  },
  render: args => ({
    components: { BaseCalendar },
    setup() {
      const date = ref(); // Управляем состоянием диалога
      const show = ref(true); // Управляем состоянием диалога
      function test(ev) {
        console.log(ev);
      }
      return { args, date, test, show };
    },
    template: `
<!--      <pre>{{ date }}</pre>-->
<!--      <button @click="show = !show">toggle</button>-->
      <BaseCalendar
        v-if="show"
        v-model="date"
        v-bind="args"
        @update="test"
        @navigate="test"
      />`,
  }),
};
