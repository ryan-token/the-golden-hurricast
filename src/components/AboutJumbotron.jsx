import React from 'react'
import Container from 'react-bootstrap/Container'

const AboutJumbotron = () => {
    const mattRyanPat = '/MattRyanPat.jpeg'
    return (
        <div className='jumbotron' style={{color: 'white', backgroundImage: `url(${mattRyanPat})`, backgroundPosition: 'center top', backgroundRepeat: 'no-repeat', height: '63vh', maxHeight: '580px', marginTop: '-5px'}}>
          <Container className='container_style' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '15px', padding: '15px'}}>
            <h1>About Us</h1>
            <p style={{ fontSize: '18px' }}>
                The Golden Hurricast is an independent podcast and blog that covers all things Golden Hurricane athletics by Ryan Token and Matt Rechtien.
            </p>
            <p style={{ fontSize: '18px' }}>
                We’re two TU alums, friends, and die-hard fans who love talking TU sports. Our content is not affiliated with The University of Tulsa.
            </p>
          </Container>
        </div>
    )
}

export default AboutJumbotron