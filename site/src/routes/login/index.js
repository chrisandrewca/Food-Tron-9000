import Nav from '../../components/nav';
import formStyle from '../../style/signup-form';
import style from './style';

const Login = ({ sent }) => {

  let page = (
    <main class={style.main}>
      <header>
        <h1>Food-Tron 9000</h1>
      </header>
      <form method='post' action='/api/login'>
        <div>
          <label>
            E-mail
					  <input name='email' type='text' placeholder='ron@flutteringtastebuds.com' />
          </label>
        </div>
        <input className='button-inverse button-input' type='submit' value='Login' />
      </form>
      <p style={{ textAlign: 'center' }}>The Food-Tron 9000 is passwordless. We'll send a login link to your email.</p>
      <Nav />
    </main>
  );

  if (sent) {
    page = (
      <main>
        <header>
          <h1>Food-Tron 9000</h1>
        </header>
        <p style={{ textAlign: 'center' }}>Sent! Your login link will be in your email.</p>
      </main>
    );
  }

  return page;
}

export default Login;