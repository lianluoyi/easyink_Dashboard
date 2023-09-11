<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props;
    const vnodes = [];
    const showNewVersionTitleList = ['获客助手'];
    if (icon && icon !== '#') {
      vnodes.push(<svg-icon icon-class={icon}/>);
    }

    if (title) {
      vnodes.push(
        <span>
          <span style={icon !== '#' ? `` : `padding-left: 10x`} slot='title'>{(title)}</span>
          {
            showNewVersionTitleList.includes(title) && <svg width='24' height='14' style='margin-left: 3px;'>
              <use href='#icon-new' />
            </svg>
          }
        </span>
      );
    }
    return vnodes;
  }
};
</script>
