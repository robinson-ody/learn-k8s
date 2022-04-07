import Link from 'next/link';

export default ({ current_user }) => {
  const links = [
    !current_user && { label: 'Sign Up', href: '/auth/sign-up' },
    !current_user && { label: 'Sign In', href: '/auth/sign-in' },
    current_user && { label: 'Sell Tickets', href: '/tickets/new' },
    current_user && { label: 'My Orders', href: '/orders' },
    current_user && { label: 'Sign Out', href: '/auth/sign-out' },
  ]
    .filter(linkConfig => linkConfig)
    .map(({ label, href }) => (
      <li className='nav-item' key={href}>
        <Link href={href}>
          <a className='nav-link'>{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className='navbar navbar-light bg-light'>
      <Link href='/'>
        <a className='navbar-brand'>GitTix</a>
      </Link>

      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  );
};
