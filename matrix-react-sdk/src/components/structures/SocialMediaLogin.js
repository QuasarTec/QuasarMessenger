import React, { useState } from 'react';
import { MatrixClientPeg } from "../../MatrixClientPeg";
import api_domain from '../../domains/api'

export default function VkLogin(props){
	const [isFetching, setFetching] = useState(false);
	const [error, setError] = useState('');

	const getCookie = async(target) => {
		const { userId } = MatrixClientPeg.get().credentials;
		const { email, password } = target;

		const login = await fetch(`${api_domain}/vk/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email.value,
				password: password.value,
				user_id: userId
			})
		});

		const data = await login.json();
		const { cookie } = data;

		return { cookie, status: login.status }
	}

	const tryToLogin = async(e) => {
		const { userId } = MatrixClientPeg.get().credentials;
		const { name } = props;
		const { target } = e;

		e.preventDefault();

		if(!isFetching){
			const { cookie, status } = await getCookie(target);
			setFetching(true);

			if(status === 200){
				await fetch('https://matrix.easy-stars.ru/api/db/add', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						user_id: userId,
						name,
						cookie
					})
				});

				props.getInitialData(cookie);
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