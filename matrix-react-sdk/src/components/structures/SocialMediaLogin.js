import React, { useState } from 'react';
import { MatrixClientPeg } from "../../MatrixClientPeg";

export default function VkLogin(props){
	const [isFetching, setFetching] = useState(false);
	const [error, setError] = useState('');

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
					email: email.value,
					password: password.value,
					userId
				})
			});

			if(login.status === 200){
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

				const accountDataRes = await fetch('http://localhost:8000/vk/account_data');
				const accountData = await accountDataRes.json();

				const activityRes = await fetch('http://localhost:8000/vk/mail/activity');
				const activityData = await activityRes.json();

				const response = {
					profile: accountData,
					activity: activityData,
					mail: chats[0]
				}

				setFetching(false);
				return setClient(response);
			}
			else{
				setError('Неправильный пароль или логин');
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

			<p className="danger">{ error }</p>

			<input type="submit" value='Войти'/>
		</form>
	)
}