import React from 'react'
import Container from 'react-bootstrap/Container'
import NavigationBar from '../components/NavigationBar'
import PodcastJumbotron from '../components/PodcastJumbotron'
import ApplePodcastsEmbed from '../components/ApplePodcastsEmbed'
import Seo from '../components/seo'

const PodcastLayout = () => {
  return (
    <div>
      <NavigationBar />
      <PodcastJumbotron />

      <div
        style={{
          marginTop: '30px',
          marginLeft: '30px',
          marginRight: '30px',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Container className='podstyle'>
            <p>
              Tune in as we discuss Tulsa athletics with TU figures including <a href='https://utulsa.edu/about/leadership/president/stacy-leeds/' target='_blank' rel='noreferrer'>President Stacy Leeds</a>, <a href='https://en.wikipedia.org/wiki/Brad_Carson' target='_blank' rel='noreferrer'>former President Brad Carson</a>, <a href='https://utulsa.edu/about/leadership/executive-staff/justin-moore/' target='_blank' rel='noreferrer'>AD Justin Moore</a>, <a href='https://tulsahurricane.com/staff-directory/tre-lamb/2657' target='_blank' rel='noreferrer'>Head Football Coach Tre Lamb</a>, <a href='https://tulsahurricane.com/staff-directory/eric-konkol/2458' target='_blank' rel='noreferrer'>Head Men's Basketball Coach Eric Konkol</a>, <a href='https://tulsahurricane.com/sports/womens-basketball/roster/coaches/angie-nelp/1685' target='_blank' rel='noreferrer'>Head Women's Basketball Coach Angie Nelp</a>, <a href='https://tulsahurricane.com/sports/football/roster/dane-evans/5365' target='_blank' rel='noreferrer'>QB Dane Evans</a>, and <a href='https://tulsahurricane.com/sports/football/roster/trevis-gipson/8011' target='_blank' rel='noreferrer'>DE Trevis Gipson</a>, media personalities such as <a href='https://tulsahurricane.com/staff-directory/bruce-howard/25' target='_blank' rel='noreferrer'>Bruce Howard</a>, <a href='https://www.kjrh.com/cayden-mcfarland' target='_blank' rel='noreferrer'>Cayden McFarland</a>, and <a href='https://tulsaworld.com/users/profile/kelly%20hines/' target='_blank' rel='noreferrer'>Kelly Hines</a>, and conference foes like Tulane's <a href='https://twitter.com/FearTheWaveBlog' target='_blank' rel='noreferrer'>Fear the Wave</a>, ECU's <a href='https://twitter.com/BoneyardPodcast' target='_blank' rel='noreferrer'>Boneyard Podcast</a>, and USF's <a href='https://x.com/SteegLife' target='_blank' rel='noreferrer'>Bay Area Examiner</a>.
            </p>
            
            <p>
              All of our episodes are available on the web via{' '}
              <a
                rel='noopener noreferrer'
                target='_blank'
                href='https://creators.spotify.com/pod/show/thegoldenhurricast'
              >
                Spotify for Creators.
              </a>
            </p>
          </Container>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Container className='podstyle'>
            <p>
              You can also find our podcast on Apple Podcasts, Spotify, Overcast,
              Pocket Casts, Castro, Goodpods, and more. Just search for 'The
              Golden Hurricast'.
            </p>
          </Container>
        </div>
        <br />
        <div>
          <Container className='podstyle'>
            <h4>Listen to the Show</h4>
            <hr />
            
            <ApplePodcastsEmbed />
          </Container>
        </div>
        <br />
      </div>
    </div>
  )
}

export default PodcastLayout

export const Head = ({ location }) => {
  return (
    <>
      <Seo
        title={'The Golden Hurricast – Podcast'}
        description={
          'A weekly podcast covering Golden Hurricane athletics at The University of Tulsa'
        }
        image={'/logo-white.jpg'}
        pathname={location.pathname}
      />
      <meta charSet='utf-8' />
      <title>TGH | Podcast</title>
    </>
  )
}