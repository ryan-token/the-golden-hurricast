/**
 * Everyone who has been on the show. Appearances are episode codes ("9-1", "3-21b" for a bonus
 * episode) or, for specials without a number and the two-part episodes (2-13), the episode's slug.
 */
export interface Guest {
	name: string;
	role?: string;
	/** Where to find them: an official bio, their outlet, or their show. */
	url?: string;
	appearances: string[];
}

export interface FeaturedGuest extends Guest {
	slug: 'stacy-leeds' | 'justin-moore' | 'tre-lamb' | 'eric-konkol' | 'angie-nelp';
	role: string;
	/** A few words for small cards, e.g. "Football". */
	short: string;
	bio: string;
	bioUrl: string;
}

export const FEATURED_GUESTS: FeaturedGuest[] = [
	{
		slug: 'stacy-leeds',
		name: 'Stacy Leeds',
		role: 'President, The University of Tulsa',
		short: 'President',
		bio: 'A sixth-generation Oklahoman from Muskogee and an alumna of TU’s College of Law. President Leeds joined us to open Season 9.',
		bioUrl: 'https://utulsa.edu/about/leadership/president/stacy-leeds/',
		appearances: ['9-1']
	},
	{
		slug: 'justin-moore',
		name: 'Justin Moore',
		role: 'Vice President & Director of Athletics',
		short: 'Athletic Director',
		bio: 'Named TU’s vice president and director of athletics in 2024. He sat down with us early in Season 7 to talk about where the department is headed.',
		bioUrl: 'https://utulsa.edu/about/leadership/executive-staff/justin-moore/',
		appearances: ['7-2']
	},
	{
		slug: 'tre-lamb',
		name: 'Tre Lamb',
		role: 'Head Football Coach',
		short: 'Football',
		bio: 'Announced as Tulsa’s 35th head football coach in December 2024. He sat down with us a month into the job to talk culture, scheme, and recruiting.',
		bioUrl: 'https://tulsahurricane.com/staff-directory/tre-lamb/2657',
		appearances: ['7-16']
	},
	{
		slug: 'eric-konkol',
		name: 'Eric Konkol',
		role: 'Head Men’s Basketball Coach',
		short: 'Men’s Basketball',
		bio: 'Our most frequent coaching guest. Coach Konkol has been breaking down the men’s basketball program with us since he arrived in 2022.',
		bioUrl: 'https://tulsahurricane.com/staff-directory/eric-konkol/2458',
		appearances: ['4-29', '6-8', '7-7', '8-10']
	},
	{
		slug: 'angie-nelp',
		name: 'Angie Nelp',
		role: 'Head Women’s Basketball Coach',
		short: 'Women’s Basketball',
		bio: 'A native of Eufaula, Oklahoma, and a Colorado State graduate. Coach Nelp joins us to talk women’s basketball.',
		bioUrl: 'https://tulsahurricane.com/sports/womens-basketball/roster/coaches/angie-nelp/1685',
		appearances: ['4-21', '7-9']
	}
];

/** A featured guest, as listed in their section of the guests page. */
function featured(slug: FeaturedGuest['slug']): Guest {
	const { name, role, bioUrl, appearances } = FEATURED_GUESTS.find((guest) => guest.slug === slug)!;
	return { name, role, url: bioUrl, appearances };
}

// One shared collator: far cheaper than `localeCompare` on every comparison, and it ignores
// case and punctuation ("J.J." sorts as "JJ").
const byName = new Intl.Collator('en', { sensitivity: 'base', ignorePunctuation: true });

/** Alphabetical by name: a person's first name, or the first word of a show's. Sorted once, when the module loads. */
const alphabetical = (guests: Guest[]) => guests.toSorted((a, b) => byName.compare(a.name, b.name));

export type GuestGroup = { name: string } & (
	| { guests: Guest[] }
	/** Grouped by the school they cover. */
	| { schools: { name: string; guests: Guest[] }[] }
);

export const GUEST_GROUPS: GuestGroup[] = [
	{
		name: 'University leadership',
		guests: [
			featured('stacy-leeds'),
			featured('justin-moore'),
			{
				name: 'Brad Carson',
				role: 'Former President',
				url: 'https://en.wikipedia.org/wiki/Brad_Carson',
				appearances: ['4-28']
			},
			{
				name: 'Rick Dickson',
				role: 'Former Athletic Director',
				url: 'https://en.wikipedia.org/wiki/Rick_Dickson',
				appearances: ['4-31', '5-6', '5-22', '6-1', '6-18']
			}
		]
	},
	{
		name: 'Coaches',
		guests: [
			featured('tre-lamb'),
			featured('eric-konkol'),
			featured('angie-nelp'),
			{
				name: 'Lauren Ramatowski',
				role: 'Head Volleyball Coach',
				url: 'https://tulsahurricane.com/sports/womens-volleyball/roster/coaches/lauren-ramatowski/2293',
				appearances: ['7-10']
			}
		]
	},
	{
		name: 'Former players',
		guests: [
			{
				name: 'Dane Evans',
				role: 'Quarterback',
				url: 'https://tulsahurricane.com/sports/football/roster/dane-evans/5365',
				appearances: ['1-8']
			},
			{
				name: 'Steve Gage',
				role: 'Quarterback',
				url: 'https://en.wikipedia.org/wiki/Steve_Gage',
				appearances: ['4-14']
			},
			{
				name: 'Trevis Gipson',
				role: 'Defensive end',
				url: 'https://tulsahurricane.com/sports/football/roster/trevis-gipson/8011',
				appearances: ['2-25']
			},
			{
				name: 'Jerry Ostroski',
				role: 'Offensive line',
				url: 'https://en.wikipedia.org/wiki/Jerry_Ostroski',
				appearances: ['5-1']
			}
		]
	},
	{
		name: 'Tulsa media',
		guests: [
			{
				name: 'Bruce Howard',
				role: 'Voice of the Golden Hurricane',
				url: 'https://tulsahurricane.com/staff-directory/bruce-howard/25',
				appearances: ['3-1']
			},
			{
				name: 'Cayden McFarland',
				role: 'KJRH',
				url: 'https://www.kjrh.com/cayden-mcfarland',
				appearances: ['4-19', '5-13', '6-2', '7-1']
			},
			{
				name: 'Jeremie Poplin',
				role: 'Statewide Director of Sports at Griffin Media, and Tulsa’s sideline reporter',
				url: 'https://www.newson6.com/jeremie-poplin',
				appearances: ['3-21b', '8-1']
			},
			{
				name: 'Kelly Hines',
				role: 'Tulsa World',
				url: 'https://x.com/kellyintulsa',
				appearances: ['4-1']
			},
			{
				name: 'Eli Lederman',
				role: 'Tulsa World / ESPN',
				url: 'https://espnpressroom.com/bio/eli-lederman/',
				appearances: ['4-4']
			},
			{
				name: 'John Tranchina',
				role: 'Formerly of the Tulsa World',
				url: 'https://x.com/icelation',
				appearances: ['5-13']
			},
			{
				name: 'Dekota Gregory',
				role: 'Formerly of the Tulsa World, now with Sooners On SI',
				url: 'https://dekotagregorywrites.wordpress.com/',
				appearances: ['2-2']
			}
		]
	},
	{
		name: 'Around the American',
		schools: [
			{
				name: 'East Carolina',
				guests: [
					{
						name: 'Jared Shafit',
						role: 'The Boneyard Podcast',
						url: 'https://x.com/BoneyardPodcast',
						appearances: ['3-10', '4-5.5', '7-11', '8-9']
					},
					{
						name: 'The Sports Objective',
						url: 'https://podcasts.apple.com/us/podcast/the-sports-objective/id1451886375',
						appearances: ['2-16', '2-20']
					}
				]
			},
			{
				name: 'Navy',
				guests: [
					{
						name: 'Mike James',
						role: 'The Mid Report',
						url: 'https://www.on3.com/sites/the-mid-report/',
						appearances: ['4-5.5', '4-11', '5-7', '8-4', '9-7']
					}
				]
			},
			{
				name: 'North Texas',
				guests: [
					{
						name: 'JD Davis',
						role: 'The North Texas Eagle',
						url: 'https://www.patreon.com/NorthTexasEagle',
						appearances: ['9-6']
					},
					{
						name: 'Miles Meador',
						role: 'The North Texas Eagle',
						url: 'https://www.patreon.com/NorthTexasEagle',
						appearances: ['7-5']
					}
				]
			},
			{
				name: 'South Florida',
				guests: [
					{
						name: 'Rob Steeg',
						role: 'The Bay Area Examiner',
						url: 'https://x.com/BayAreaExaminer',
						appearances: ['3-9', '4-9', '5-12']
					},
					{
						name: 'Nathan Bond',
						role: 'The Bay Area Examiner',
						url: 'https://x.com/BayAreaExaminer',
						appearances: ['4-5.5']
					}
				]
			},
			{
				name: 'Tulane',
				guests: [
					{
						name: 'JP Gooderham',
						role: 'Fear the Wave',
						url: 'https://x.com/FearTheWaveBlog',
						appearances: ['3-14', '4-13', '5-10']
					},
					{
						name: 'Kelly Comarda',
						role: 'Fear the Wave Collective',
						url: 'https://x.com/FTWMediaGroup',
						appearances: ['6-10']
					},
					{
						name: 'Jack Chasanoff',
						role: 'The Uptown Update',
						url: 'https://x.com/TUptownUpdate',
						appearances: ['8-6']
					}
				]
			},
			{
				name: 'UTSA',
				guests: [
					{ name: 'The Alamo Audible', url: 'https://alamoaudible.com/', appearances: ['7-8'] }
				]
			}
		]
	},
	{
		name: 'Beyond the American',
		guests: alphabetical([
			{
				name: 'Matt Jones',
				role: 'WholeHogSports (Arkansas)',
				url: 'https://www.wholehogsports.com/staff/matt-jones/',
				appearances: ['9-5']
			},
			{
				name: 'Collin Neill',
				role: 'Sam Houston SportsTalk',
				url: 'https://samhoustonsportstalk.substack.com/',
				appearances: ['9-3']
			},
			{
				name: 'Calvin Alexander',
				role: 'The CGA Tour (Oklahoma State)',
				url: 'https://www.youtube.com/@thecgatour',
				appearances: ['8-5', '9-2']
			},
			{
				name: 'Zac Blackerby',
				role: 'Locked On Auburn',
				url: 'https://podcasts.apple.com/us/podcast/locked-on-auburn-daily-podcast-on-auburn-tigers-football/id1091363992',
				appearances: ['8-26']
			},
			{
				name: 'Brandon Uhrig',
				role: 'GoBeercats (Cincinnati)',
				url: 'https://catskellersocial.club/gobeercats',
				appearances: ['4-12', '5-6']
			},
			{
				name: 'The Scott & Holman Pawdcast',
				role: 'Houston',
				url: 'https://x.com/SHPawdcast',
				appearances: ['2-15', '4-7.5', '5-19']
			},
			{
				name: 'Ruby Draayer',
				role: 'Red Cup Rebellion (Ole Miss)',
				url: 'https://www.redcuprebellion.com/authors/ruby-draayer',
				appearances: ['5-5']
			},
			{
				name: 'Eddie Carifio',
				role: 'The Daily Chronicle (Northern Illinois)',
				url: 'https://www.daily-chronicle.com/',
				appearances: ['5-3', '6-6']
			},
			{
				name: 'Joey Kaufman',
				role: 'The Columbus Dispatch (Ohio State)',
				url: 'https://www.dispatch.com/staff/5494426002/joey-kaufman/',
				appearances: ['5-14']
			},
			{
				name: 'Cody Tucker',
				role: '7220 Sports (Wyoming)',
				url: 'https://7220sports.com/cody-tucker/',
				appearances: ['5-2']
			},
			{
				name: 'Dub’d Up',
				role: 'Washington Huskies podcast',
				url: 'https://x.com/dubduphuskies',
				appearances: ['6-4']
			},
			{
				name: 'Phillip Slavin',
				role: 'Ten12 Podcast Network',
				url: 'https://x.com/Ten12Network',
				appearances: ['3-3', '7-3', '8-6']
			},
			{
				name: 'Nick Coppola',
				role: 'Las Cruces Sun-News, now a Clemson beat writer',
				url: 'https://www.greenvilleonline.com/staff/74687010007/nick-coppola/',
				appearances: ['8-3']
			},
			{
				name: 'Matt Belinson',
				role: 'Ruston Daily Leader',
				url: 'https://www.rustonleader.com/',
				appearances: ['7-4']
			},
			{
				name: 'Harry Minium',
				role: 'Old Dominion',
				url: 'https://odusports.com/staff/harry-minium',
				appearances: ['4-17']
			},
			{
				name: 'Roger Phipps',
				role: 'Co-host of Knightline (UCF)',
				url: 'https://podcasts.apple.com/us/podcast/knightline/id897257176',
				appearances: ['3-6']
			}
		])
	},
	{
		name: 'Friends of the show',
		guests: alphabetical([
			{
				name: 'Hunter Hart',
				role: 'Our first-ever guest, and the creator of Reign Cane Sports',
				url: 'https://x.com/ReignCaneSports',
				appearances: ['1-4']
			},
			{
				name: 'Chris Rathbone',
				role: '@ReignCaneTulsa',
				url: 'https://x.com/ReignCaneTulsa',
				appearances: [
					'fan-takeover-chris-rathbone-reigncanetulsa-talks-tu-fandom-why-tulsa-belongs-at-the-top-tre-lamb-the-2025-football-season-and-more'
				]
			},
			{
				name: 'J.J. Cody-Fox',
				role: 'Host of J.J.’s No Sports Zone, our bye-week tradition',
				url: 'https://x.com/vajaysquared',
				appearances: ['3-4', '5-8', '7-6', '8-11']
			},
			{
				name: 'Zach McKinnell',
				role: 'FCS Football Central',
				url: 'https://www.si.com/college/fcs',
				appearances: ['8-2']
			},
			{
				name: 'Kegan Reneau',
				role: 'The Franchise',
				url: 'https://www.thefranchiseok.com/',
				appearances: ['6-5']
			},
			{
				name: 'Joe Broback',
				role: 'Underdog Dynasty, now The College Football Guy',
				url: 'https://www.youtube.com/@collegefootballguy',
				appearances: ['3-18']
			},
			{
				name: 'Clayton Trutor',
				role: 'Author, formerly of Down the Drive',
				url: 'https://www.amazon.com/stores/author/B098B6J1X5',
				appearances: ['3-8']
			},
			{
				name: 'Ron Clements',
				role: 'Author',
				url: 'https://www.amazon.com/stores/author/B08CS1XH36',
				appearances: ['2-14']
			}
		])
	}
];

/** Every guest in a group, school by school where it's grouped that way. */
export const guestsIn = (group: GuestGroup): Guest[] =>
	'schools' in group ? group.schools.flatMap((school) => school.guests) : group.guests;
