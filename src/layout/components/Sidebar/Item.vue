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

    if (icon && icon !== '#') {
      vnodes.push(<svg-icon icon-class={icon}/>);
    }

    if (title) {
      vnodes.push(<span style={icon !== '#' ? `` : `padding-left: 10x`} slot='title'>{(title)}</span>);
    }
    return vnodes;
  }
};
</script>
