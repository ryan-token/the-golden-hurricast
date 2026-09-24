import React from 'react'
import Container from 'react-bootstrap/Container'
import AskAQuestionButton from '../components/AskAQuestionButton'

// Apple's badge is the official one from Apple Marketing Tools (embedded icon downscaled
// to 128px); the rest are Podlink's matching dark badges: https://github.com/TeamPodlink/badges
const PLATFORMS = [
  { name: 'Apple Podcasts', badge: 'listen-on-apple-podcasts.svg', url: 'https://podcasts.apple.com/us/podcast/the-golden-hurricast/id1435008302?itscg=30200&itsct=podcast_box&ls=1&mttnsubad=1435008302' },
  { name: 'Spotify', badge: 'listen-on-spotify.svg', url: 'https://open.spotify.com/show/16ik0AuBrpVBfWn73jlJio' },
  { name: 'Overcast', badge: 'listen-on-overcast.svg', url: 'https://overcast.fm/itunes1435008302/the-golden-hurricast' },
  { name: 'Pocket Casts', badge: 'listen-on-pocket-casts.svg', url: 'https://pca.st/podcast/eba6ed30-9102-0136-7b92-27f978dac4db' },
  { name: 'Castro', badge: 'listen-on-castro.svg', url: 'https://castro.fm/podcast/56521e78-b84b-429b-a580-073bd42d97a7' },
  { name: 'Goodpods', badge: 'listen-on-goodpods.svg', url: 'https://goodpods.com/podcasts/the-golden-hurricast-185396' },
]

const PodcastJumbotron = () => {
    return (
      <div className='jumbotron'>
        <Container className='container_style'>
            <h1>The Golden Hurricast</h1>
            <p style={{ fontSize: '18px' }}>
                A weekly podcast covering Golden Hurricane athletics at The University of Tulsa.
            </p>

            <AskAQuestionButton />

            <div className='listen-on-badges'>
                {PLATFORMS.map(({ name, badge, url }) => (
                    <a key={name} rel='noopener noreferrer' target='_blank' href={url}>
                        <img src={`/listenOnX/${badge}`} alt={`Listen on ${name}`} height='40' />
                    </a>
                ))}
            </div>
        </Container>
      </div>
    )
}

export default PodcastJumbotron
