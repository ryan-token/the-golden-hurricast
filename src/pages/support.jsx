import React from 'react'
import NavigationBar from '../components/NavigationBar'
import Container from 'react-bootstrap/Container'
import SupportJumbotron from '../components/SupportJumbotron'
import Seo from '../components/seo'

const SupportLayout = () => {
  return (
    <div>
      <NavigationBar />
      <SupportJumbotron />

      <div
        style={{
          marginTop: '130px',
          marginBottom: '30px',
          marginLeft: '30px',
          marginRight: '30px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container id='supportus' style={{marginTop: '-75px'}}>

          <h4> How to Support Us </h4>
          <hr />
          
          <p>
            <b>Way #1:</b> Join our {' '}
              <a
                rel='noopener noreferrer'
                target='_blank'
                href='https://patreon.com/thegoldenhurricast'
              >
                Patreon
              </a>
            {'! '}
            Unlock access to our newsletter, advanced stat breakdowns, automatic NIL contributions, and much more.
          </p>
          
          <br />
          
          <p>
            <b>Way #2:</b> Sign up for a {' '}
              <a
                rel='noopener noreferrer'
                target='_blank'
                href='https://creators.spotify.com/pod/show/thegoldenhurricast/support'
              >
                recurring monthly donation
              </a>
            {' '}
            on Spotify for Creators (our podcast host).
          </p>
          
          <br />
          
          <p>
            {' '}
            <b>Way #3:</b> Buy our{' '}
            <a href='/merch'>
              merchandise
            </a>
            .
          </p>
          
          <br />
          
          <p>
            {' '}
            <b>Way #4:</b> Make a{' '}
            <a
              rel='noopener noreferrer'
              target='_blank'
              href='https://paypal.me/thegoldenhurricast'
            >
              one-time donation
          </a>{' '}
            of any amount via PayPal.
          </p>
          
          <br />
          
          <p>
            {' '}
            <b>Way #5:</b> Leave a{' '}
            <a
              rel='noopener noreferrer'
              target='_blank'
              href='https://x.com/goldenhurricast'
            >
              tip on X
          </a>
          . Just tap the dollar bills icon at the top of our profile.
          </p>
          
        </Container>
      </div>
    </div>
  )
}

export default SupportLayout

export const Head = ({ location }) => {
  return (
    <>
      <Seo
        title={'Support The Golden Hurricast'}
        description={'We do all of this for free and for the love of TU athletics'}
        image={'/logo-white.jpg'}
        pathname={location.pathname}
      />
      <meta charSet='utf-8' />
      <title>TGH | Support Us</title>
    </>
  )
}