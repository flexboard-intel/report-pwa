import React, { Component } from 'react';
import './user-home.css';
import {Icon} from 'antd'
import {Link } from 'react-router-dom';
import {addErrorNoti, addNotification} from './../../Utils';
import { STATUS} from './../../Consts';
import {applicationServerPublicKey, urlB64ToUint8Array} from "../../Utils";
import {observer} from "mobx-react/index";

class UserHome extends Component {
    constructor(props) {
        super(props);
        this.removeReport = this.removeReport.bind(this);
    }
    state = {
        notificationStatus: true,
        editing: false,
        newEmail: this.props.store.user.email,
        oldPass: "",
        newPass: "",
        newNickname: this.props.store.user.name,
        editNewPassword: false,
        adminStatus: false,
        sendEmail: this.props.store.user.sendEmail
    }
    async removeReport(status, report_id) {
        try {
           
            let reqProps = {
                method: 'POST',
                headers: new Headers({
                    'content-type': 'application/json'
                }),
                body: JSON.stringify({
                    email: this.props.store.user.email,
                    report_id: report_id
                })
            };
            let response = await fetch("/remove_report", reqProps);
            if (response.status === 500) {
                addErrorNoti();
            }
            else if (response.status === 200) {
                this.props.fetchReports(this.props.store.user);
            }
        }catch (e) {
            addErrorNoti();
        }
    };

    getDateStr = (startDateStr, endDateStr, status, index, report_id, recurring, statusDescription, note, allDay) => {
        let locale = "en-us";
        let startDate = new Date(startDateStr)
        let endDate = new Date(endDateStr)
        let timeStr = ('0' + startDate.getUTCHours()).slice(-2) + ":" + ('0' + startDate.getUTCMinutes()).slice(-2) +
        " - " + ('0' + endDate.getUTCHours()).slice(-2) + ":" + ('0' + endDate.getUTCMinutes()).slice(-2)
        let copyStartDate = new Date(startDate.getTime());
        let statusStr = status + (statusDescription !== STATUS.FREE_STYLE ? " - " + statusDescription : note !== "" ? " - " + note : "")
        let copyEndDate = new Date(endDate.getTime());
        if (recurring) {
            let weekday = startDate.toLocaleString(locale, { weekday: "long" });
            return (<tr key={index} className="report"><th>{"Every " + weekday}</th>
                    <th>{allDay ? "All Day" : timeStr}</th>
                    <th>{statusStr}</th>
                    <th><Icon type="close" className="remove-report-button" onClick={() => this.removeReport(status, report_id)}/></th></tr>);
        }
        else if (copyStartDate.setHours(0,0,0,0) === copyEndDate.setHours(0,0,0,0)) {
            let month = startDate.toLocaleString(locale, { month: "short" });
            return (<tr key={index} className="report">
                <th>{month + " " + startDate.getDate()}</th>
                    <th>{status === STATUS.ARRIVING ? "" : allDay ? "All Day" : timeStr}</th>
                    <th>{status === STATUS.ARRIVING ?  STATUS.ARRIVING : statusStr}</th>
                    <th><Icon type="close"  onClick={() => this.removeReport(status, report_id)} className="remove-report-button"/></th></tr>);
        } else {
            let monthStart = startDate.toLocaleString(locale, { month: "short" });
            let monthEnd = endDate.toLocaleString(locale, { month: "short" });
            return (<tr key={index} className="report"><th>{monthStart + " " + startDate.getDate() + " - " + monthEnd + " " + endDate.getDate()}</th>
                    <th></th><th>{statusStr}</th>
                    <th><Icon type="close" className="remove-report-button" onClick={() => this.removeReport(status, report_id)}/></th></tr>);
        }
    };

    fetchGroupName = async () => {
        try {
            let reqProps = {
                method: 'GET',
            };
            let response = await fetch("/get_group_name?user="+this.props.store.user.email, reqProps);
            if (response.status === 200) {
                let resJson = await response.json();
                this.setState({
                    groupName: resJson.name
                })
            }
            else {
                addErrorNoti();
            }
        }catch (e) {
            addErrorNoti();
        }
    }

    fetchAdminStatus = async (email) => {
        try {
            let reqProps = {
                method: 'GET',
            };
            let response = await fetch("/get_admin_status?email="+email, reqProps);
            if (response.status === 200) {
                let resJson = await response.json();
                this.setState({
                    adminStatus: resJson.admin
                })
            }
            else {
                addErrorNoti();
            }
        }catch (e) {
            addErrorNoti();
        }
    }

    async componentDidMount() {
        this.fetchAdminStatus(this.props.store.user.email);
        await this.fetchGroupName();
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            this.setState({
                notificationStatus: false
            })
        }
        else if (Notification.permission !== "granted") {
            this.setState({
                notificationStatus: false
            })
        } else if (Notification.permission === "granted") {
            try {
                const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
                let reg = await navigator.serviceWorker.ready;
                let sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey});
                let reqProps = {
                    method: 'POST',
                    headers: new Headers({
                        'content-type': 'application/json'
                    }),
                    body: JSON.stringify({
                        email: this.props.store.user.email,
                        sub: JSON.stringify(sub)
                    })
                };

                let response = await fetch("/check_subscription", reqProps);
                if (response.status === 500) {
                    addErrorNoti();
                }
                else if (response.status === 200) {
                    this.setState({
                        notificationStatus: true
                    })
                }
                else if (response.status !== 200) {
                    this.setState({
                        notificationStatus: false
                    })
                }
                

            }catch (e) {
                addErrorNoti();
            }
        }

    }
    addSubscription = async (sub) => {
        try {
            let reqProps = {
                method: 'POST',
                headers: new Headers({
                    email: this.props.store.user.email,
                    sub: sub
                })
            };

            let response = await fetch("/add_subscription", reqProps);
            if (response.status === 500) {
                throw new Error({msg:"Can't remove notification, internet connection, or server error", status:response.status});
            }
            else if (response.status === 200) {
                this.setState({
                    notificationStatus: true
                })
            }
        }catch (e) {
            addErrorNoti();
            this.setState({
                notificationStatus: false
            })
        }
    };
    removeSubsciption = async (sub) => {
        try {
            let reqProps = {
                method: 'POST',
                headers: new Headers({
                    email: this.props.store.user.email,
                    sub: sub
                })
            };

            let response = await fetch("/remove_subscription", reqProps);
            if (response.status === 500) {
                throw new Error({msg:"Can't remove notification, internet connection, or server error", status:response.status});
            }
            else if (response.status === 200) {
                this.setState({
                    notificationStatus: false
                })
            }
        }catch (e) {
            addErrorNoti();
        }
    };
    
    changeNotificationStatus =  async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            this.setState({
                notificationStatus: false
            })
            addNotification("This phone does not support notifications");
        }
        else if (Notification.permission === "default") {
            let permission = await Notification.requestPermission();
            if (permission === "granted") {
                console.log("Granted permission for notifications!");
                const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
                let reg = await navigator.serviceWorker.ready;
                let sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey});
                let subJson = JSON.stringify(sub);
                this.addSubscription(subJson);
            } else {
                this.setState({
                    notificationStatus: false
                })
            }
        } else if (Notification.permission === "granted") {
            const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
            let reg = await navigator.serviceWorker.ready;
            let sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey});
            let subJson = JSON.stringify(sub);
            if (this.state.notificationStatus) {
                this.removeSubsciption(subJson);
            } else {
                this.addSubscription(subJson);
            }
        } else if (Notification.permission === "denied") {
            addNotification(<p>Norifications are blocked!<br/> Go to chrome settings to edit</p>);
        } else {
            console.log("notification permission status unknown", Notification.permission);
        }
    };
    onlyUnique(reports) {
        if (reports) {
            let newReports = []
            reports.forEach((report) => {
                if (report.recurring) {
                    let idxOfId = newReports.findIndex(newReport => newReport._id === report._id);
                    if (idxOfId === -1) {
                        newReports.push(report); 
                    }
                
                } else newReports.push(report);
            })
            return newReports;
       
        } else return [];
    }
    getTableWrapperStyle() {
        let h = document.getElementById("top");
        if (h && h.clientHeight) {
            return {
                height: "calc(100vh - " + (h.clientHeight + 15) + "px)",
                width: "100%",
                position: "relative"
            };
        }

    }
    editProfile = () => {
        if (this.state.editing) {
            this.setState({
                newEmail: this.props.store.user.email,
                oldPass: "",
                newPass: "",
                editing: false,
                newNickname: this.props.store.user.name,
                editNewPassword: false
            })
            
        } else {
            this.setState({
                editing: true
            })
        }
    }
    changePwdVisibility = (inputID) => {
        let x = document.getElementById(inputID);
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }
    submitProfileChanges = async () => {
        try {
            if (this.state.oldPass === "") {
                return;
            }
            this.props.startLoading()
            let reqProps = {
                method: 'POST',
                headers: new Headers({
                    'content-type': 'application/json'
                }),
                body: JSON.stringify({
                    oldEmail: this.props.store.user.email,
                    newEmail: this.state.newEmail,
                    oldPass: this.state.oldPass,
                    newPass: this.state.newPass,
                    nickname: this.state.newNickname,
                    sendEmail: this.state.sendEmail
                })
            };

            let response = await fetch("/change_profile", reqProps);
            if (response.status === 500) {
                throw new Error({msg:"Can't remove notification, internet connection, or server error", status:response.status});
            }
            else if (response.status === 401) {
                let resJson = await response.json()
                addNotification(resJson.msg);
                this.props.stopLoading();
            }
            else if (response.status === 200) {
                addNotification("New Details Updated!");
                await this.props.subscribeUser(this.state.newPass !== "" ? this.state.newPass : this.state.oldPass, this.state.newEmail, "/login", undefined)
                this.setState({
                    oldPass: "",
                    newPass: "",
                    editing: false,
                })
                
            }
        }catch (e) {
            addErrorNoti();
            this.props.stopLoading();
        }
    };
    editNewPass = () => {
        if (this.state.oldPass === "") {
            return
        }
        this.setState({
            editNewPassword: true,
        }, () => {
            document.getElementById("pwd-edit-new").focus()
        })
    };
    render() {

        return (
            <div className="user-home">
                <Link to="/"><i className="prev-arrow"/></Link>
                <div id="top">
                    <div className="info">
                        <div className="full-name">
                            {this.props.store.user ? this.props.store.user.name : ""}
                        </div>
                        { this.state.adminStatus ?
                        <Link to="/admin-settings">
                            <span className="admin-text">
                                <Icon type="tool" className="admin-tools" />
                                Admin
                            </span>
                        </Link> : ""}

                        <div className="email">
                            {this.props.store.user ? this.props.store.user.email : ""}
                        </div>
                        <div className="location">
                            {this.state.groupName}
                        </div>
                    </div>

                    <div className="user-option">
                        <div className="edit-profile" onClick={this.editProfile}>
                            {this.state.editing ? <Icon type="database" className="edit-img" />
                                 : <Icon type="edit" className="edit-img"/>}
                            
                        </div>
                        <img alt="notification status" src={this.state.notificationStatus ? "/images/noti-on.png" : "/images/noti-off.png"} className="notification-updater" onClick={this.changeNotificationStatus}/>
                    </div>

                </div>
                
                {this.state.editing ? 
                <div style={{color: this.state.oldPass === "" ? "grey" : "white",
                            borderColor: this.state.oldPass === "" ? "grey" : "white", position: "relative", top: this.state.adminStatus ? "30px" : "0px"}}
                >

                    <fieldset className="field-set-input user-home-input old-password">
                        <input type="password" id="pwd-edit-old" placeholder="Password" className="text-password" value={this.state.oldPass} onChange={(e) => this.setState({oldPass: e.target.value})}/>
                        <Icon type="eye-o" className="pwd-visibility-icon" onClick={() => this.changePwdVisibility("pwd-edit-old")}/>
                    </fieldset>
                    <fieldset className="field-set-input user-home-input">
                        <input type="text" placeholder="Email" disabled={this.state.oldPass === ""} className="text-password" value={this.state.newEmail} onChange={(e) => this.setState({newEmail: e.target.value})}/>
                    </fieldset>
                    <fieldset className="field-set-input user-home-input">
                        <input type="text" placeholder="Nickname" disabled={this.state.oldPass === ""} className="text-password" value={this.state.newNickname} onChange={(e) => this.setState({newNickname: e.target.value})}/>
                    </fieldset>
                    <div className="send-email-cb">
                        <input type="checkbox" id="c2" checked={this.state.sendEmail} onChange={() => this.setState({sendEmail: !this.state.sendEmail})}/><label htmlFor="c2">Send me calendar event</label>
                    </div>
                    <fieldset className="field-set-input user-home-input" style={{width: this.state.editNewPassword ? "80%" : "60%"}}>

                    {this.state.editNewPassword ?
                        <div>
                        <input type="password" id="pwd-edit-new" disabled={this.state.oldPass === ""} placeholder="New Password" className="text-password" value={this.state.newPass} onChange={(e) => this.setState({newPass: e.target.value})}/>
                        <Icon type="eye-o" className="pwd-visibility-icon" onClick={() => this.changePwdVisibility("pwd-edit-new")}/>
                        </div>
                     : <div className=""  onClick={this.editNewPass}>Change Password</div>}
                    </fieldset>
                    <div className="submit-changes-button" onClick={this.submitProfileChanges} >
                            Submit
                        </div>
                    <div className="logout-button" onClick={this.props.logout}>
                        Logout
                        <Icon type="user-delete" className="logout-img"/>
                    </div>
                        
                </div> : <div className="table-wrapper" style={this.getTableWrapperStyle()}>
                <table className="user-reports">
                    <tbody>
                    {this.onlyUnique(this.props.reports).map((report, index) => {
                        return (
                            this.getDateStr(report.startDate, report.endDate, report.status, index, report._id, report.recurring, report.statusDescription, report.note, report.allDay)
                        )
                    })}
                    </tbody>
                </table>
                </div>}
            </div>
        );
    }
}

export default observer(UserHome);