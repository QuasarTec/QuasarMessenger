import React, { Component } from 'react';

export default class VkLogin extends Component{
	constructor(props){
		super(props);

		this.state = {
			login: '',
			password: ''
		}
	}

	changeStateByInput = e => {
		const { name, value } = e.target;

		this.setState({
			name: value
		});
	}

	tryToLogin = e => {
		e.preventDefault();
		window.ipcRenderer.send('vk_login', this.state);
	}

	render(){
		
		return(
			<form>
				<input type="text" placeholder='Телефон или email' onChange={ this.changeStateByInput } />
				<input type="password" placeholder='Пароль' onChange={ this.changeStateByInput } />
				<input type="submit" onClick={ this.tryToLogin }/>
			</form>
		)
	}
}