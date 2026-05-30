import React from 'react'
import Container from 'react-bootstrap/Container'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import AskAQuestionButton from '../components/AskAQuestionButton'

const HomeJumbotron = () => {
    return (
      <div className='jumbotron'>
          <Container>
            <h1>The Golden Hurricast</h1>
            <p style={{ fontSize: '18px' }}>
              The leading independent podcast and blog covering Golden Hurricane
              athletics at The University of Tulsa.
            </p>
            
            <AskAQuestionButton />
            
            <br />
            
            <ButtonToolbar className='jumbotron-social-icons'>
              <a
                style={{ marginRight: '10px' }}
                rel='noopener noreferrer'
                target='_blank'
                href='https://podcasts.apple.com/us/podcast/the-golden-hurricast/id1435008302?mt=2'
              >
                <picture>
                  <source type='image/webp' srcSet='/brand_icons/applePodcasts.webp' style={{ height: '35px', width: '35px' }} />
                  <img src='/brand_icons/applePodcasts.png' alt='Apple Podcasts icon' style={{ height: '35px', width: '35px' }} />
                </picture>
              </a>
    
              <a
                style={{ marginRight: '10px' }}
                rel='noopener noreferrer'
                target='_blank'
                href='https://open.spotify.com/show/16ik0AuBrpVBfWn73jlJio'
              >
                <picture>
                  <source type='image/webp' srcSet='/brand_icons/spotify.webp' style={{ height: '35px', width: '35px' }} />
                  <img src='/brand_icons/spotify.png' alt='Spotify icon' style={{ height: '35px', width: '35px' }} />
                </picture>
              </a>
              
              <a
                  style={{ marginRight: '10px' }}
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://patreon.com/thegoldenhurricast'
                >
                  <picture>
                    <img src='/brand_icons/patreon.png' alt='Patreon icon' style={{ height: '35px', width: '35px' }} />
                  </picture>
                </a>
                
              <a
                style={{ marginRight: '10px', paddingTop: '3px' }}
                rel='noopener noreferrer'
                target='_blank'
                href='https://discord.gg/xkPegtBjVD'
              >
                <picture>
                  <img src='/brand_icons/discord.png' alt='Discord icon' style={{ height: '26px', width: '35px' }} />
                </picture>
              </a>
              
              <a
                style={{marginRight: '10px'}}
                rel='noopener noreferrer'
                target='_blank'
                href='https://x.com/goldenhurricast'
              >
                <picture>
                  <img src='/brand_icons/x.png' alt='X icon' style={{ height: '35px', width: '35px' }} />
                  </picture>
              </a>

              <a
                style={{marginRight: '10px'}}
                rel='noopener noreferrer'
                target='_blank'
                href='https://bsky.app/profile/thegoldenhurricast.com'
              >
                <picture>
                  <img src='/brand_icons/bluesky.svg' alt='Bluesky icon' style={{ height: '35px', width: '35px' }} />
                </picture>
              </a>

              <a
                style={{ marginRight: '10px' }}
                rel='noopener noreferrer'
                target='_blank'
                href='mailto:thegoldenhurricast@gmail.com'
              >
                <picture>
                  <source type='image/webp' srcSet='/brand_icons/email.webp' style={{ height: '35px', width: '35px' }} />
                  <img src='/brand_icons/email.png' alt='Email icon' style={{ height: '35px', width: '35px' }} />
                </picture>
              </a>
            </ButtonToolbar>
          </Container>
      </div>
    )
}

export default HomeJumbotron