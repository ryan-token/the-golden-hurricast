import React, { useEffect } from 'react'

// X's widgets.js still powers the Follow button (its embedded profile timeline
// was retired by X). Bluesky has no follow/feed widget at all. So for viewing
// posts, both platforms use the shared <SocialCard> link-out below.
const WIDGETS_SRC = 'https://platform.twitter.com/widgets.js'

const loadWidgets = () => {
	if (typeof window === 'undefined') return

	if (window.twttr?.widgets) {
		window.twttr.widgets.load()
		return
	}

	if (document.querySelector(`script[src="${WIDGETS_SRC}"]`)) return

	const script = document.createElement('script')
	script.src = WIDGETS_SRC
	script.async = true
	document.body.appendChild(script)
}

const XLogo = ({ size = 24 }) => (
	<svg viewBox='0 0 24 24' width={size} height={size} fill='currentColor' aria-hidden='true' style={{ flexShrink: 0 }}>
		<path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
	</svg>
)

const BlueskyLogo = ({ size = 24 }) => (
	<svg viewBox='0 0 568 501' width={size} height={size} fill='currentColor' aria-hidden='true' style={{ flexShrink: 0 }}>
		<path d='M123.121 33.664C188.241 82.553 258.281 163.747 284 207.035c25.719-43.288 95.759-124.482 160.879-173.371C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664Z' />
	</svg>
)

// Shared card used for both X and Bluesky — only the color, logo, handle and url differ.
const SocialCard = ({ url, backgroundColor, logo, handle }) => (
	<a
		href={url}
		target='_blank'
		rel='noopener noreferrer'
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: '14px',
			marginTop: '1rem',
			padding: '16px 20px',
			maxWidth: '420px',
			borderRadius: '12px',
			backgroundColor,
			color: '#fff',
			textDecoration: 'none',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
		}}
	>
		{logo}
		<span style={{ flex: 1, lineHeight: 1.3 }}>
			<span style={{ display: 'block', fontWeight: 'bold' }}>See our latest posts</span>
			<span style={{ display: 'block', fontSize: '13px', opacity: 0.8 }}>{handle}</span>
		</span>
		<span aria-hidden='true' style={{ fontSize: '20px', lineHeight: 1 }}>→</span>
	</a>
)

const Socials = () => {
	useEffect(() => { loadWidgets() }, [])

	return (
		<div>
			{/* X Follow button — block wrapper so the widget's iframe isn't clipped by a flex row. */}
			<div style={{ minHeight: '28px' }}>
				<a
					href='https://twitter.com/GoldenHurricast?ref_src=twsrc%5Etfw'
					className='twitter-follow-button'
					data-size='large'
					data-show-count='false'
				>
					Follow @GoldenHurricast
				</a>
			</div>

			<SocialCard
				url='https://x.com/GoldenHurricast'
				backgroundColor='#000000'
				logo={<XLogo size={26} />}
				handle='@GoldenHurricast'
			/>

			<SocialCard
				url='https://bsky.app/profile/thegoldenhurricast.com'
				backgroundColor='#0085ff'
				logo={<BlueskyLogo size={26} />}
				handle='@thegoldenhurricast.com'
			/>
		</div>
	)
}

export default Socials
