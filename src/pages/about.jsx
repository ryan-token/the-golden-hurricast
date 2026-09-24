import React from 'react'
import NavigationBar from '../components/NavigationBar'
import AboutJumbotron from '../components/AboutJumbotron'
import Container from 'react-bootstrap/Container'
import Seo from '../components/seo'

const AboutLayout = () => {
  return (
    <div>
      <NavigationBar />
      <AboutJumbotron />
      
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

        <Container id='aboutus' style={{marginTop: '-75px'}}>
          <h4> Our Podcast </h4>
          <hr />
          <div>
            Inspired by the late Reign Cane Sports podcast,
            The Golden Hurricast took up the mantle and officially debuted in
            August of 2018. <br /> <br /> Since then, we've been lucky enough to chat with several TU players, coaches, and administrators including:
              <ul style={{marginTop: '0.5rem'}}>
                <li><b>Stacy Leeds</b> - Current President</li>
                <li><b>Brad Carson</b> - Former President</li>
                <li><b>Justin Moore</b> - Current Athletic Director</li>
                <li><b>Rick Dickson</b> - Former Athletic Director</li>
                <li><b>Tre Lamb</b> - Head Football Coach</li>
                <li><b>Eric Konkol</b> - Head Men's Basketball Coach</li>
                <li><b>Angie Nelp</b> - Head Women's Basketball Coach</li>
                <li><b>Dane Evans</b> - Former QB</li>
                <li><b>Steve Gage</b> - Former QB</li>
                <li><b>Trevis Gipson</b> - Former DE</li>
              </ul>
              
            We've also brought on Tulsa media personalities such as:
              <ul style={{marginTop: '0.5rem'}}>
                <li><b>Bruce Howard</b></li>
                <li><b>Cayden McFarland</b></li>
                <li><b>Kelly Hines</b></li>
              </ul>
            
            And plenty more.
          </div>
          
          <br />

          <p>
              You can find our <a href='/podcast'>podcast</a> on Apple Podcasts, Spotify, Overcast,
              Pocket Casts, Castro, Goodpods, and more. Just search for 'The Golden Hurricast'.
          </p>

          <br />

          <h4> Our Blog </h4>
          <hr />
          <p>
            In the fall of 2019, we decided to up our game a bit and create a <a href='/blog'>blog</a>. Affectionately known as Hurc's Corner, our blog was officially born on September 19, 2019. The name Hurc's Corner comes from TU's former mascot Hurc the Hurricane (also known as Huffy, but we prefer Hurc).
          </p>
          <p>
            Our goal with this blog is to dive deeper into stats, explore TU history, and write about interesting milestones as Tulsa athletics continues to progress. Matt (former Sports Editor for The Collegian) kicked things off by writing a couple stat-focused articles, and Ryan joined in with {''}
            <a href='https://www.thegoldenhurricast.com/picking-new-rivals'>
              'Tulsa vs Everybody: Picking New Rivals'
            </a>
              . It's been a joint effort ever since.
          </p>

          <p>
            The blog was going well, but we were unhappy with the WordPress URL
            (hercscorner.home.blog) and some of the other WordPress limitations.
            Ryan decided to build us a custom website and {' '}
            <a href='https://thegoldenhurricast.com'>TheGoldenHurricast.com</a>{' '}
            was born. We have high hopes for the website, so let us know if
            there's anything you'd like us to add in the future.
          </p>

          <br />

          <h4> Contact Us </h4>
          <hr />
          <p>
            X:{' '}
            <a
              rel='noopener noreferrer'
              target='_blank'
              href='https://x.com/goldenhurricast'
            >
              @GoldenHurricast
          </a>
            <br />
            Bluesky:{' '}
            <a
              rel='noopener noreferrer'
              target='_blank'
              href='https://bsky.app/profile/thegoldenhurricast.com'
            >
              @thegoldenhurricast.com
          </a>
            <br />
            Email:{' '}
            <a href='mailto:thegoldenhurricast@gmail.com'>
              TheGoldenHurricast@gmail.com
            </a>
            <br />
            Spotify for Creators:{' '}
            <a
              rel='noopener noreferrer'
              target='_blank'
              href='https://creators.spotify.com/pod/show/thegoldenhurricast'
            >
              https://creators.spotify.com/pod/show/thegoldenhurricast
          </a>
          </p>
        </Container>
      </div>
    </div>
  )
}

export default AboutLayout

export const Head = ({ location }) => {
  return (
    <>
      <Seo
        title={'About The Golden Hurricast'}
        description={"We're an independent podcast and blog that covers all things Golden Hurricane athletics"}
        image={'/logo-white.jpg'}
        pathname={location.pathname}
      />
      <meta charSet='utf-8' />
      <title>TGH | About Us</title>
    </>
  )
}