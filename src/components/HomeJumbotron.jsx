import React from 'react'
import Container from 'react-bootstrap/Container'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import AskAQuestionButton from '../components/AskAQuestionButton'

const SOCIAL_LINKS = [
  { name: 'Apple Podcasts', icon: 'applePodcasts.png', webp: 'applePodcasts.webp', url: 'https://podcasts.apple.com/us/podcast/the-golden-hurricast/id1435008302?itscg=30200&itsct=podcast_box&ls=1&mttnsubad=1435008302' },
  { name: 'Spotify', icon: 'spotify.png', webp: 'spotify.webp', url: 'https://open.spotify.com/show/16ik0AuBrpVBfWn73jlJio' },
  { name: 'Patreon', icon: 'patreon.png', url: 'https://patreon.com/thegoldenhurricast' },
  { name: 'Discord', icon: 'discord.png', url: 'https://discord.gg/xkPegtBjVD', height: 26 },
  { name: 'X', icon: 'x.png', url: 'https://x.com/goldenhurricast' },
  { name: 'Bluesky', icon: 'bluesky.svg', url: 'https://bsky.app/profile/thegoldenhurricast.com' },
  { name: 'Email', icon: 'email.png', webp: 'email.webp', url: 'mailto:thegoldenhurricast@gmail.com' },
]

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
              {SOCIAL_LINKS.map(({ name, icon, webp, url, height = 35 }) => (
                <a key={name} rel='noopener noreferrer' target='_blank' href={url}>
                  <picture>
                    {webp && <source type='image/webp' srcSet={`/brand_icons/${webp}`} />}
                    <img src={`/brand_icons/${icon}`} alt={`${name} icon`} width='35' height={height} />
                  </picture>
                </a>
              ))}
            </ButtonToolbar>
          </Container>
      </div>
    )
}

export default HomeJumbotron
