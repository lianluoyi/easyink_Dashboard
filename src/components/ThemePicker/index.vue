<template>
  <el-color-picker
    v-model="theme"
    :predefine="[
      '#409EFF',
      '#1890ff',
      '#304156',
      '#212121',
      '#11a983',
      '#13c2c2',
      '#6959CD',
      '#f5222d'
    ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script>
import { successCode, readyStateSucCode } from '@/utils/httpCode';

const version = require('element-ui/package.json').version; // element-ui version from node_modules
const ORIGINAL_THEME = '#409EFF'; // default color
const RED_END = 2;
const GREEN_START = 2;
const GREEN_END = 4;
const BLUE_START = 4;
const BLUE_END = 6;
const COLOR_ROUND = 255;
const COLOR_STRING = 16;

export default {
  data() {
    return {
      chalk: '', // content of theme-chalk css
      theme: ''
    };
  },
  computed: {
    defaultTheme() {
      return this.$store.state.settings.theme;
    }
  },
  watch: {
    defaultTheme: {
      handler: function(val, oldVal) {
        this.theme = val;
      },
      immediate: true
    },
    theme(val) {
      this.changeTheme(val);
    }
  },
  methods: {
    async changeTheme(val) {
      const oldVal = this.chalk ? this.theme : ORIGINAL_THEME;
      if (typeof val !== 'string') return;
      const themeCluster = this.getThemeCluster(val.replace('#', ''));
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''));
      console.log(themeCluster, originalCluster);

      const $message = this.$message({
        message: '  Compiling the theme',
        customClass: 'theme-message',
        type: 'success',
        duration: 0,
        iconClass: 'el-icon-loading'
      });

      const getHandler = (variable, id) => {
        return () => {
          const originalCluster = this.getThemeCluster(
            ORIGINAL_THEME.replace('#', '')
          );
          const newStyle = this.updateStyle(
            this[variable],
            originalCluster,
            themeCluster
          );

          let styleTag = document.getElementById(id);
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.setAttribute('id', id);
            document.head.appendChild(styleTag);
          }
          styleTag.innerText = newStyle;
        };
      };

      if (!this.chalk) {
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`;
        await this.getCSSString(url, 'chalk');
      }

      const chalkHandler = getHandler('chalk', 'chalk-style');

      chalkHandler();

      const styles = [].slice
        .call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText;
          return (
            new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
          );
        });
      styles.forEach(style => {
        const { innerText } = style;
        if (typeof innerText !== 'string') return;
        style.innerText = this.updateStyle(
          innerText,
          originalCluster,
          themeCluster
        );
      });

      this.$emit('change', val);

      $message.close();
    },
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style;
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index]);
      });
      return newStyle;
    },

    getCSSString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === readyStateSucCode && xhr.status === successCode) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '');
            resolve();
          }
        };
        xhr.open('GET', url);
        xhr.send();
      });
    },

    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, RED_END), 16);
        let green = parseInt(color.slice(GREEN_START, GREEN_END), 16);
        let blue = parseInt(color.slice(BLUE_START, BLUE_END), 16);

        if (tint === 0) {
          // when primary color is in its rgb space
          return [red, green, blue].join(',');
        } else {
          red += Math.round(tint * (COLOR_ROUND - red));
          green += Math.round(tint * (COLOR_ROUND - green));
          blue += Math.round(tint * (COLOR_ROUND - blue));

          red = red.toString(COLOR_STRING);
          green = green.toString(COLOR_STRING);
          blue = blue.toString(COLOR_STRING);

          return `#${red}${green}${blue}`;
        }
      };

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, RED_END), 16);
        let green = parseInt(color.slice(GREEN_START, GREEN_END), 16);
        let blue = parseInt(color.slice(BLUE_START, BLUE_END), 16);

        red = Math.round((1 - shade) * red);
        green = Math.round((1 - shade) * green);
        blue = Math.round((1 - shade) * blue);

        red = red.toString(COLOR_STRING);
        green = green.toString(COLOR_STRING);
        blue = blue.toString(COLOR_STRING);

        return `#${red}${green}${blue}`;
      };

      const clusters = [theme];
      const CIRCLE_COUNT = 9;
      const FLOOR = 10;
      const FIX_DIGITS = 2;
      const SHADE = 0.1;
      for (let i = 0; i <= CIRCLE_COUNT; i++) {
        clusters.push(
          tintColor(theme, Number((i / FLOOR).toFixed(FIX_DIGITS)))
        );
      }
      clusters.push(shadeColor(theme, SHADE));
      return clusters;
    }
  }
};
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
