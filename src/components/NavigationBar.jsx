import React from 'react'
import { Link } from 'gatsby'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

const NavigationBar = () => {
  return (
    <div style={{ marginBottom: '75px' }}>
      <Navbar fixed='top' collapseOnSelect expand='md' bg='dark' variant='dark' style={{ padding: '10px' }}>
        <Navbar.Brand as={Link} to='/'>
          <picture>
            <source type='image/webp' srcSet='/logo-navbar-white.webp' />
            <img src='/logo-navbar-white.png' alt='The Golden Hurricast logo' width='50' height='48' style={{ marginRight: 15 }} />
          </picture>
          The Golden Hurricast
        </Navbar.Brand>

        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav' style={{ marginLeft: '17px' }}>
          <Nav className='ms-auto'>
            <Nav.Link as={Link} to='/podcast'>Podcast</Nav.Link>
            <Nav.Link href='https://patreon.com/thegoldenhurricast'>Patreon</Nav.Link>
            <Nav.Link as={Link} to='/merch'>Merch</Nav.Link>
            <Nav.Link as={Link} to='/about'>About</Nav.Link>
            <Nav.Link as={Link} to='/support'>Support</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  )
}

export default NavigationBar
