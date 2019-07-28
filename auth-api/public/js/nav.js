let url="/api/get_user";
		fetch(url).then(response => response.json())
		.then( (result) => {
				console.log('success:', result);
				let login = document.getElementById('login');
				let logout = document.getElementById('logout');
				let view_details =document.getElementById('view_details');
				let upload_li = document.getElementById('upload_li');
				let add_li = document.getElementById('add_li');
				let update_li =document.getElementById('update_li');

				// let welcome_user = document.getElementById('welcome_user');
				// welcome_user.innerHTML = `Welcome ${result.user.fname}!`;

				login.style.display = 'none';
				logout.style.display = 'block';
				view_details.style.display = 'block';

				let role = `${result.user.role}`;
				if(role == "FACULTY"){
					upload_li.style.display = 'block';
				}
				if(role == "ADMIN"){
					update_li.style.display = 'block';
					add_li.style.display = 'block';
				}

			//	div.innerHTML=`name: ${result.user.fname}<br/>username: ${result.user.username}`;
		})
		.catch(error => {
			let login = document.getElementById('login');
			let logout = document.getElementById('logout');
			let view_details =document.getElementById('view_details');
			let upload_li = document.getElementById('upload_li');
			let add_li =document.getElementById('add_li');
			let update_li =document.getElementById('update_li');
			login.style.display = 'block';
			logout.style.display = 'none';
			view_details.style.display = 'none';
			upload_li.style.display = 'none';
			update_li.style.display = 'none';
			add_li.style.display = 'none';
			console.log('error:', error);
		});
