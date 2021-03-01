import React, { useState } from 'react';
import { MatrixClientPeg } from "../../MatrixClientPeg";

export default function VkLogin(props){
	const [isFetching, setFetching] = useState(false);

	const tryToLogin = async(e) => {
		e.preventDefault();

		if(!isFetching){
			setFetching(true);

			const { userId } = MatrixClientPeg.get().credentials;

			const { setClient } = props;
			const { email, password } = e.target;

			const login = await fetch('http://localhost:8000/vk/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					login: email.value,
					password: password.value,
					userId
				})
			});

			const { err } = await login.json();

			if(!err){
				const chatsRes = await fetch('http://localhost:8000/vk/mail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						offset: 0
					})
				});
				
				const chats = await chatsRes.json();

				let accountData = await fetch('http://localhost:8000/vk/account_data');

				const response = {
					profile: accountData,
					mail: chats[0]
				}

				setFetching(false);
				return setClient(response);
			}

			return setFetching(false);
		}
	}

	return(
		<form className='mx_SocialMediaLogin' onSubmit={ tryToLogin } autoComplete='off'>
			<input type='text' 
					name='email'
					placeholder='Телефон или email' />

			<input type='password' 
					name='password' 
					placeholder='Пароль' />

			<input type="submit" value='Войти'/>
		</form>
	)
}