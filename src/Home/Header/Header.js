import React, { Component } from 'react';
import './header.css'
import {Icon} from 'antd';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import Power0 from 'gsap'
import TweenMax from 'gsap/TweenMax';
import { STATUS } from '../../Consts';

class Header extends Component {

    handlePrevClick = () => {
        let el = document.getElementById(this.props.store.status);
        let prevB = document.getElementById("prev-button");
        if (prevB) {
            prevB.style.pointerEvents = 'none';
        }
        switch (this.props.store.slideNumber) {
            case 1:
                TweenMax.to(".status-div", 0.0, {zIndex: 2})
                TweenMax.to(".app-body", 0.0, {zIndex: 2})
                TweenMax.to(".date-time-picker-wrapper", 0.2, {opacity: 0, zIndex: 1})
                let allEl = document.getElementsByClassName("status-wrapper");
                
                TweenMax.to(el, 0.7, {height:'26%'})
                for (let i = 0; i <allEl.length; i++) {
                    TweenMax.to(allEl[i], 0.0, {borderWidth: '10px'})
                    if (allEl[i] !== el) {
                        TweenMax.to(allEl[i], 0.7, {height:'26%'})
                        TweenMax.to(allEl[i], 0.7, {x: '+=300', opacity: 1})
                        
                    }
                }
                TweenMax.to(".status-button", 0.7, {width: '100%', height: '100%', ease: Power0.easeOut, delay: 0.7})
                TweenMax.to(".status-next-button", 0.7, {opacity: 1, ease: Power0.easeOut, delay: 0.7})
                this.props.store.prevSlide();
                setTimeout(() => {
                    if (prevB) {
                        prevB.style.pointerEvents = 'auto';
                    }
                }, 1400);
                break;
            case 2:
                TweenMax.to(".submit-screen", 0.3, {opacity: 0, zIndex: 1});
                TweenMax.to(".time-picker-wrapper", 0.2, {y: "+=76", ease: Power0.easeOut, delay: 0.3});
                TweenMax.to(".date-chosen-text", 0.2, {y: "+=55", ease: Power0.easeOut, delay: 0.5});
                
                TweenMax.to(el, 0.2, {y:'+=35', delay: 0.7})
                if (this.props.store.status === STATUS.WF) {
                    TweenMax.to(".header-text", 0.2, {x: '+=75', delay: 0.9})
                } else if (this.props.store.status === STATUS.OOO) {
                    TweenMax.to(".header-text", 0.2, {x: '+=53', delay: 0.9})
                }
                TweenMax.to(el, 0.2, {x: '-=45', delay: 0.9})

                TweenMax.to(".date-time-picker-wrapper", 0.0, {zIndex: 2, delay: 1.1});
                TweenMax.to(".date-title", 0.7, {width: '95%', ease: Power0.easeOut, delay: 1.2});
                let rangeElement = document.getElementsByClassName("RangeExample")[0]
                rangeElement.removeAttribute("style");
                let cssComputedHeight = rangeElement.clientHeight;
                TweenMax.to(".RangeExample", 0.0, {height: 0});
                TweenMax.to(".RangeExample", 0.7, {height: cssComputedHeight + "px", ease: Power0.easeOut, delay: 1.2});
                TweenMax.to(".date-next-button", 0.7, {opacity: 1, delay: 1.2});    
                TweenMax.to(".date-img", 0.0, {opacity: 1, delay: 1.9});

                if (this.props.store.allDay) {
                    TweenMax.to(".time-picker-wrapper", 0.0, {opacity: 1, delay: 1.9});    
                }
                TweenMax.to(".all-day-wrapper", 0.0, {opacity: 1, delay: 1.9});
                this.props.store.prevSlide();
                setTimeout(() => {
                    if (prevB) {
                        prevB.style.pointerEvents = 'auto';
                    }
                }, 1900);
                break;
            default:
                console.log("No match for previous click!");

        }
        
    }

    componentDidMount() {
        // let that = this
        // window.addEventListener('popstate', function(event) {
            // console.log("popstate");
            // console.log(event.state);
            // if (event.state && event.state.slideNumber !== undefined) {
            //     that.handlePrevClick();
            // }
            // else {
                // window.history.pushState({}, '');
            // }
            // that.props.store.resetAll();
            // that.props.history.push('//');
        // })
    }

    render() {
        return (
            <div className="header">
                <Link to="/settings"><Icon className="user-settings-button" type="user"/></Link>
                {this.props.store.slideNumber !== 0  ? <i className="prev-arrow" id="prev-button" onClick={this.handlePrevClick}/>: ""}
                <div className="title-font-style"><div className="header-text">I AM</div></div>
            </div>
        );
    }
}

export default Header = observer(Header)
