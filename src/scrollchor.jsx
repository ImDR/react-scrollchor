import React from 'react';
import PropTypes from 'prop-types';
import { animateScroll, updateHistory, isElementVisible } from './helpers';

export default class Scrollchor extends React.Component {
  constructor (props) {
    super(props);
    this.state = Scrollchor._stateHelper(props);
    this.simulateClick = this._handleClick;
  }

  static propTypes = {
    to: PropTypes.string.isRequired,
    animate: PropTypes.shape({
      offset: PropTypes.number,
      duration: PropTypes.number,
      easing: PropTypes.func
    }),
    beforeAnimate: PropTypes.func,
    afterAnimate: PropTypes.func,
    disableHistory: PropTypes.bool,
    children: PropTypes.node
  }

  componentDidMount() {
    window.addEventListener("orientationchange", this.orientationchange)
  }

  orientationchange(event) {
    console.dir(event)
    const visible = isElementVisible(document.getElementById(this.state.to))
    if(!visible) {
      animateScroll(this.state.to, this.state.animate)
      console.log('move into view')
    } else {
      console.log('no need')
      return
    }
  }

  static _stateHelper (props) {
    const {
      // default animate object
      offset = 0,
      duration = 400,
      easing = easeOutQuad
    } = props.animate || {};
    return {
      to: (props.to && props.to.replace(/^#/, '')) || '',
      animate: { offset, duration, easing },
      beforeAnimate: props.beforeAnimate || function () {},
      afterAnimate: props.afterAnimate || function () {},
      disableHistory: props.disableHistory
    };
  }

  _handleClick = (event) => {
    this.state.beforeAnimate(event);
    event && event.preventDefault();

    if(window.location.hash.substr(1) === this.state.to && this.state.to !== 'header') return

    animateScroll(this.state.to, this.state.animate)
      .then((id) => {
        if (id) {
          this.state.disableHistory || updateHistory(id);
          this.state.afterAnimate(event);
        }
      });
  }

  static getDerivedStateFromProps (props) {
    return Scrollchor._stateHelper(props);
  }

  componentWillReceiveProps (props) {
    this.setState(Scrollchor._stateHelper(props));
  }

  render () {
    const { to, animate, beforeAnimate, afterAnimate, disableHistory, ...props } = this.props; // eslint-disable-line no-unused-vars

    return !this.props.children
      ? null
      : <a {...props} href={'#' + this.state.to} onClick={this._handleClick} />;
  }
}

// Default easing function
// jQuery easing 'swing'
function easeOutQuad (x, t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
}

// Setup for React version 16.3.x and beyond
const reSemver = /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/; // eslint-disable-line no-useless-escape
const [,, major, minor] = reSemver.exec(React.version);
major >= 16 && minor >= 3 && delete Scrollchor.prototype.componentWillReceiveProps;
