"""Vector artwork for the Birdie Breakout textures without a supplied source."""

from io import BytesIO
from math import cos, pi, sin
from random import Random

from PIL import Image


def render_svg(width, height, body, definitions=''):
    from resvg_py import svg_to_bytes

    document = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"
      viewBox="0 0 {width} {height}"><defs>{definitions}</defs>{body}</svg>'''
    with Image.open(BytesIO(bytes(svg_to_bytes(svg_string=document)))) as rendered:
        return rendered.convert('RGBA')


def linear(name, stops, direction='vertical'):
    end = 'x2="0" y2="1"' if direction == 'vertical' else 'x2="1" y2="0"'
    colors = ''.join(f'<stop offset="{offset}" stop-color="{color}"/>' for offset, color in stops)
    return f'<linearGradient id="{name}" x1="0" y1="0" {end}>{colors}</linearGradient>'


GOLD = ((0, '#fff4ae'), (.24, '#ffd75a'), (.53, '#c87516'), (.76, '#8e4511'), (1, '#f7b842'))
GREEN = ((0, '#37703b'), (.23, '#225231'), (.58, '#163e2e'), (1, '#09291f'))
INK = '#21150f'


def golf_ball(gold=False):
    rim = '#311c0c' if gold else '#17251d'
    cream = '#fff8b3' if gold else '#fbfff0'
    center = '#e8a827' if gold else '#ccd9c9'
    shade = '#824218' if gold else '#5d766b'
    dimple = '#9e6219' if gold else '#82968a'
    gloss = '#fff2aa' if gold else '#ffffff'
    dimples = []
    for row, y in enumerate(range(37, 229, 25)):
        for x in range(37 + (row % 2) * 13, 232, 25):
            edge = ((x - 128) ** 2 + (y - 125) ** 2) ** .5 / 108
            if edge > .98:
                continue
            radius = 8 - edge * 2
            dimples.append(f'''<g opacity="{.52 + y / 850:.2f}">
              <ellipse cx="{x}" cy="{y}" rx="{radius:.1f}" ry="{radius * .80:.1f}" fill="url(#dimple)"/>
              <path d="M {x-radius*.62:.1f} {y+2} q {radius*.64:.1f} 5 {radius*1.28:.1f} 0"
                fill="none" stroke="{gloss}" stroke-opacity=".46" stroke-width="1.8" stroke-linecap="round"/>
            </g>''')
    definitions = f'''
      <radialGradient id="shell" cx=".36" cy=".26" r=".76"><stop stop-color="{cream}"/>
        <stop offset=".55" stop-color="{center}"/><stop offset="1" stop-color="{shade}"/></radialGradient>
      <radialGradient id="dimple" cx=".65" cy=".65" r=".75"><stop stop-color="{gloss}" stop-opacity=".03"/>
        <stop offset="1" stop-color="{dimple}"/></radialGradient>
      <clipPath id="ball"><circle cx="128" cy="125" r="105"/></clipPath>'''
    return render_svg(256, 256, f'''
      <ellipse cx="128" cy="231" rx="83" ry="14" fill="#19180e" opacity=".33"/>
      <circle cx="128" cy="128" r="112" fill="{rim}"/>
      <circle cx="128" cy="123" r="104" fill="url(#shell)"/>
      <g clip-path="url(#ball)">{''.join(dimples)}
        <path d="M40 95 Q59 31 129 26 Q94 32 74 66 Q57 97 40 95" fill="{gloss}" opacity=".64"/>
        <path d="M55 194 Q113 241 190 186 Q211 170 221 149 Q211 202 177 221 Q103 256 55 194" fill="{shade}" opacity=".25"/>
      </g>
      <path d="M33 111 A96 96 0 0 1 114 28" fill="none" stroke="{gloss}" stroke-width="4.5"
        opacity=".72" stroke-linecap="round"/>
      {star(191, 54, 17, '#fff2a5') if gold else ''}
    ''', definitions)


def star(x, y, size, color='#fff3a0'):
    wing = size * .25
    return f'''<path d="M{x} {y-size} Q{x+wing} {y-wing} {x+size} {y}
      Q{x+wing} {y+wing} {x} {y+size} Q{x-wing} {y+wing} {x-size} {y}
      Q{x-wing} {y-wing} {x} {y-size}Z" fill="{color}"/>'''


def wood():
    grain = []
    rng = Random(204)
    for index in range(34):
        y = 4 + index * 6
        bend = rng.randint(-8, 8)
        tone = '#ffbb60' if index % 3 == 0 else '#2b130e'
        grain.append(f'''<path d="M-30 {y} C116 {y+bend*3} 197 {y-bend} 292 {y+2}
          S448 {y+bend} 545 {y-1}" fill="none" stroke="{tone}"
          stroke-width="{rng.choice((1, 2, 3))}" opacity=".30"/>''')
    return render_svg(512, 208, f'''
      <path d="M0 0H512V208H0Z" fill="url(#wood)"/>{''.join(grain)}
      <g fill="none" stroke="#f9a755" opacity=".32">
        <path d="M-8 133C60 90 76 144 145 113S188 94 239 100" stroke-width="3"/>
        <path d="M306 41C364 10 396 66 446 42S484 34 514 40" stroke-width="2"/>
        <path d="M362 50q34-22 69 0q-39 16-69 0z M30 134q29-24 63-4q-36 16-63 4z"/>
      </g>
    ''', linear('wood', ((0, '#875326'), (.19, '#643917'), (.55, '#4a2915'), (1, '#301b12'))))


def plaque(bonus=False):
    definitions = linear('gold', GOLD) + linear('felt', GREEN) + linear('shadow', ((0, '#442713'), (1, '#1f170d')))
    border = 'M28 16Q14 16 14 35L5 58 14 80V112Q14 128 31 128H409Q427 128 427 112V80L436 58 427 35Q427 16 410 16Z'
    panel = 'M37 31H403Q413 31 413 42V105Q413 114 403 114H37Q27 114 27 105V42Q27 31 37 31Z'
    return render_svg(440, 144, f'''
      <path d="{border}" transform="translate(0 5)" fill="#17140c" stroke="#21150f" stroke-width="7"/>
      <path d="{border}" fill="url(#{'gold' if bonus else 'shadow'})" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>
      <path d="{panel}" fill="url(#felt)" stroke="url(#gold)" stroke-width="5"/>
      <path d="M39 33H400 M43 112H397" stroke="#ffe99a" stroke-width="2" stroke-linecap="round" opacity=".53"/>
      <path d="M35 41Q200 47 404 39V63Q214 48 34 67Z" fill="#a9ea81" opacity=".08"/>
      <path d="M37 103Q186 97 403 104" stroke="#77934a" stroke-width="2" fill="none" opacity=".4"/>
      {''.join(f'<circle cx="{x}" cy="{y}" r="4.2" fill="url(#gold)" stroke="{INK}" stroke-width="1.6"/>' for x in (17, 423) for y in (44, 97))}
      {star(51, 28, 12) + star(396, 107, 13) if bonus else ''}
    ''', definitions)


def trophy():
    return render_svg(144, 144, f'''
      <g stroke="{INK}" stroke-width="5" stroke-linejoin="round">
        <path d="M43 25Q12 14 12 35q-1 26 33 35l7-12q-26-8-27-20 1-7 17 0Z
          M102 25q31-11 31 10 1 26-33 35l-7-12q26-8 27-20-1-7-17 0Z" fill="url(#gold)"/>
        <path d="M35 15H110Q104 78 77 79V99l22 10 7 15H41l6-15 20-10V79Q38 70 35 15Z" fill="url(#gold)"/>
        <path d="M39 16q30 8 67 0l-1 13q-32 8-64 0Z M41 120H106L114 132H32Z" fill="url(#gold)"/>
      </g>
      <path d="M51 35q2 21 12 28" fill="none" stroke="#fff6ad" stroke-width="4" stroke-linecap="round"/>
      {star(83,51,18)}{star(118,82,11)}{star(22,77,10)}
    ''', linear('gold', GOLD))


def cart():
    definitions = ''.join((
        linear('gold', GOLD), linear('paint', ((0, '#b9f07c'), (.26, '#5dae52'), (.6, '#277d43'), (1, '#15523b'))),
        linear('cream', ((0, '#fff0ba'), (.44, '#dba458'), (1, '#805026'))),
        linear('glass', ((0, '#d5f7f0'), (.53, '#7bc3ca'), (1, '#35747e'))),
        linear('metal', ((0, '#dce6c3'), (.33, '#73877a'), (.67, '#34443c'), (1, '#1d2721'))),
        linear('rubber', ((0, '#55605a'), (1, '#182520'))),
        linear('leather', ((0, '#eea25a'), (.4, '#b04f24'), (1, '#682821'))),
        '<radialGradient id="ground"><stop stop-color="#152419" stop-opacity=".6"/><stop offset="1" stop-color="#142a14" stop-opacity="0"/></radialGradient>',
    ))
    return render_svg(560, 372, f'''
      <ellipse cx="277" cy="331" rx="252" ry="35" fill="url(#ground)"/>
      <g stroke="{INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M451 150q31-18 62-7l-3 130-55 1Z" fill="url(#leather)"/>
        <path d="m467 153 19-61m-1 60 35-51m-24 56 39-27" fill="none" stroke="#2a3027"/>
        <path d="M481 95q-9-12 3-19l22-3q7 1 5 8l-16 12Z M516 105q-7-9 1-16l18 3q7 3 3 8l-14 7Z M530 132q-5-9 5-12l14 1-5 9Z" fill="url(#metal)" stroke-width="4"/>
        <path d="M463 159q16 12 41-3m-32 37q27-13 29 9l-2 41-26 5Z" fill="#8d3825" stroke-width="4"/>
        <path d="M118 255q23-47 50-22l38 21 177-5q16-32 48-28l32 29 5 40-347 12Z" fill="#273a2d"/>
        <path d="m79 233 50-133 9 3-34 131m259-130 16-8 48 139-13 5m49-143 15-1-12 139-13-1Z" fill="url(#metal)"/>
        <path d="m132 122 202-7-27 92-204 18Z" fill="url(#glass)" stroke-width="5"/>
        <path d="m143 133 62-2-57 83-27 2Z m80-2 19-2-56 82-19 2Z" fill="#e1ffee" opacity=".49" stroke="none"/>
        <path d="M229 189q19-20 37-9l9 8m-26 5 7 24" fill="none" stroke="#313c37" stroke-width="7"/>
        <path d="M374 172q14-15 53-12 27 2 29 26l6 30-89 5Z" fill="url(#cream)"/>
        <path d="M362 214q29-9 100-6l19 21-11 16-105 4-14-18Z" fill="url(#cream)"/>
        <path d="m421 174 8 35m-29-35 6 36m-19 21 56-4" stroke-width="2.7" fill="none" stroke="#7a572e"/>
        <path d="M80 225q22-13 90-18l136-10q28 1 55 13l-7 20 12 12 90-9 5-19q30-5 41 12l-1 61-53 14
          q-4-43-36-43-30 1-40 50l-180 8q-15-50-44-48-26 1-40 38l-52-12-14-23 3-24Z" fill="url(#paint)"/>
        <path d="M53 256q27 21 131 5l171-26 11 7 90-9 5-19q26-5 37 11m-285 61 139-14 15-29" fill="none" stroke="#c4e889" stroke-width="4"/>
        <path d="M46 269q17 11 63 12l-8 22-47-7-13-14Z M197 301l170-15-3 13-167 14Z" fill="url(#metal)" stroke-width="4"/>
        <path d="M66 250q4-14 23-15l29-4-10 15q-18 10-42 4Z M137 231l41-7-14 17-38 5Z" fill="#fff1a5" stroke-width="4"/>
        <path d="M97 108q19-25 113-36l196-12q51 2 72 24l7 16-27 11-328 21-35-7Z" fill="url(#cream)"/>
        <path d="M96 109q30-24 129-29l191-13q39 1 56 16l9 11q-18 16-58 16l-291 17q-30-1-37-12Z" fill="url(#paint)"/>
        <path d="M107 111q46-16 125-22l183-13q34 0 54 12l-50 6q-173 13-302 26Z" fill="#b6e589" stroke="none" opacity=".8"/>
        <path d="M117 122 435 101q28-2 45-8" fill="none" stroke="#ffd56c" stroke-width="4"/>
        {''.join(cart_wheel(x, y, size) for x, y, size in ((143,309,41), (399,302,39), (478,285,22)))}
        <path d="m260 262 40-5-10 18-35 4Z" fill="url(#gold)" stroke-width="3"/>
      </g>
      <path d="M76 224q19-13 71-15 M213 296l22-2" fill="none" stroke="#dcffab" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    ''', definitions)


def cart_wheel(x, y, size):
    return f'''<g transform="translate({x} {y}) scale({size/42:.3f})">
      <ellipse rx="42" ry="49" fill="url(#rubber)"/>
      <ellipse cx="-3" rx="25" ry="32" fill="url(#metal)" stroke-width="4"/>
      <path d="m-3-22 1 43m-15-9 30-23m-30 0 29 22" stroke="#ecdfa6" stroke-width="5"/>
      <circle cx="-3" r="8" fill="url(#gold)" stroke-width="3"/>
      <path d="M-36 16l7-8 M-36 3l7-8 M-34-11l8-8 M-30-24l7-6 M-32 29l7-7 M-24 38l7-6" stroke="#6d7460" stroke-width="2.5"/>
    </g>'''


def glow():
    rng = Random(23)
    rays = []
    for index in range(24):
        angle = (index * 15 + rng.randrange(-4, 4)) * pi / 180
        distance = rng.randrange(195, 255)
        width = rng.randrange(5, 16)
        points = [(256, 256), (256 + cos(angle) * distance - sin(angle) * width, 256 + sin(angle) * distance + cos(angle) * width),
                  (256 + cos(angle) * distance + sin(angle) * width, 256 + sin(angle) * distance - cos(angle) * width)]
        coord = ' '.join(f'{x:.1f},{y:.1f}' for x, y in points)
        rays.append(f'<polygon points="{coord}" fill="#ffd876" opacity="{rng.uniform(.3,.77):.2f}"/>')
    return render_svg(512, 512, f'''
      <circle cx="256" cy="256" r="254" fill="url(#aura)"/>
      <g mask="url(#fade)">{''.join(rays)}</g>
    ''', '''<radialGradient id="aura"><stop stop-color="#fffbc2" stop-opacity=".9"/>
      <stop offset=".4" stop-color="#ffcf53" stop-opacity=".52"/><stop offset="1" stop-color="#ffb32a" stop-opacity="0"/></radialGradient>
      <radialGradient id="mask"><stop stop-color="white"/><stop offset=".48" stop-color="white"/>
      <stop offset="1" stop-color="black"/></radialGradient><mask id="fade"><circle cx="256" cy="256" r="255" fill="url(#mask)"/></mask>''')


def sparks():
    fragments = [(29, 108, -31), (15, 74, -42), (48, 24, -56), (108, 19, 24), (139, 43, 67), (146, 93, 65), (124, 131, 46), (57, 143, -18)]
    leaves = ''.join(f'''<path d="M{x} {y+10}q-9-17 0-27 11 14 0 27Z" transform="rotate({a} {x} {y})"
      fill="url(#grass)" stroke="#183018" stroke-width="1.7"/>''' for x, y, a in fragments)
    return render_svg(160, 160, leaves + star(35, 46, 10) + star(132, 63, 14) + star(95, 128, 8) + star(79, 12, 9),
                      linear('grass', ((0, '#ffffab'), (.45, '#b6e944'), (1, '#358b2f'))))


def firework():
    rng = Random(55)
    streaks = []
    for angle in range(0, 360, 15):
        elevation = angle * pi / 180
        radius = rng.randrange(68, 113)
        x, y = 128 + cos(elevation) * radius, 128 + sin(elevation) * radius
        x1, y1 = 128 + cos(elevation) * radius * .25, 128 + sin(elevation) * radius * .25
        color = rng.choice(('#ffd16b', '#ff9f58', '#fce7a9', '#fff2d1'))
        streaks.append(f'''<path d="M{x1:.2f} {y1:.2f}L{x:.2f} {y:.2f}" stroke="{color}"
          stroke-width="2" opacity=".76" stroke-linecap="round"/>
          <circle cx="{x:.2f}" cy="{y:.2f}" r="2.9" fill="{color}"/>{star(x, y, 5, color) if angle%60==0 else ''}''')
    return render_svg(256, 256, f'<circle cx="128" cy="128" r="81" fill="url(#halo)"/>{"".join(streaks)}{star(128,128,23)}', '''
       <radialGradient id="halo"><stop stop-color="#ffe98e" stop-opacity=".64"/><stop offset="1" stop-color="#f18542" stop-opacity="0"/></radialGradient>''')


def grid_highlight():
    return render_svg(112, 112, f'''
      <rect x="4" y="4" width="104" height="104" rx="14" fill="#c1e755" fill-opacity=".19" stroke="#382114" stroke-width="4"/>
      <rect x="7" y="7" width="98" height="98" rx="11" fill="none" stroke="url(#rail)" stroke-width="3"/>
      {star(12, 13, 7)}{star(99, 98, 8)}
    ''', linear('rail', GOLD))


def swing_trail():
    return render_svg(352, 178, f'''
      <path d="M9 155C38 74 128 13 327 62C182 1 69 3 9 155Z" fill="url(#trail)" opacity=".44"/>
      <path d="M9 155C39 64 152 30 338 70" fill="none" stroke="url(#trail)" stroke-width="11" stroke-linecap="round"/>
      <path d="M30 122C73 51 174 37 333 68" fill="none" stroke="#fff8bc" stroke-width="3.6" opacity=".9" stroke-linecap="round"/>
      {star(89,62,11)}{star(182,49,12)}{star(238,76,8)}{star(314,63,19)}
    ''', linear('trail', ((0, '#72d968'), (.3, '#e9df6d'), (.72, '#fff7c0'), (1, '#ffb941')), 'horizontal'))


SWING_POSES = (
    # shoulder, elbow, hands, club head, torso lean (degrees)
    ((96,106), (111,131), (137,158), (163,214), -3),
    ((89,103), (79,83), (47,71), (20,32), -9),
    ((97,104), (114,135), (137,151), (172,111), 7),
    ((104,102), (119,87), (124,65), (171,29), 11),
    ((98,104), (87,89), (107,68), (175,66), 4),
)


def golfer_pose(shoulder, elbow, hands, club, lean):
    return f'''
      <ellipse cx="108" cy="249" rx="77" ry="11" fill="#15291b" opacity=".29"/>
      <g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M167 154q10-15 25-9l9 77q-3 17-19 15l-14-4Z" fill="url(#bag)"/>
        <path d="m177 150-4-32 m12 30 10-36 m-3 39 14-25" fill="none" stroke="#344137" stroke-width="3.7"/>
        <path d="M170 120q-5-9 1-12l12 3-2 6Z M192 115q-3-9 2-12l12 5-3 6Z M202 128q-2-7 4-9l9 2-3 6Z" fill="#a9b5a1" stroke-width="2"/>
        <path d="M174 167q8-10 16-4l7 39-3 20-15 1Z" fill="#71332a" stroke-width="2.3"/>
        <path d="M116 151q8 16 12 39l10 45-18 4-17-33-9-29-9 27-6 35-17-2 1-44 9-45Z" fill="url(#khaki)"/>
        <path d="m106 178 11 30 8 18m-42-55-8 37-2 17" fill="none" stroke="#755630" stroke-width="2.2"/>
        <path d="M62 230q12 2 19-1l-1 10q0 10-20 11l-17-1q-4-5 12-10Z M121 232q7 5 15-1l10 8q10 3 7 8l-25 1-10-6Z" fill="url(#shoes)"/>
        <path d="M45 246q14 2 29-3 M127 246l23-2" fill="none" stroke="#e6e3c5" stroke-width="2.2"/>
        <g transform="rotate({lean} 94 145)">
          <path d="M71 99q7-13 19-15l19 2q13 5 16 18l-9 24 0 25q-14 10-44 1l3-25-10-20Z" fill="url(#shirt)"/>
          <path d="m78 89 12 8 17-10 5 5-15 14-6-3-6 3-12-12Z" fill="#24659a" stroke-width="2"/>
          <path d="M72 148q27 6 45-1v9q-15 7-45 2Z" fill="#755039" stroke-width="2"/>
          <path d="M88 79l-2 10 11 7 11-10-2-10Z" fill="#c48953" stroke-width="2"/>
          <path d="M77 49q5-19 24-15 18 2 18 21l-2 12 4 5-7 3q-4 14-15 13-15-2-19-20-5 0-5-7Z" fill="url(#skin)"/>
          <path d="M76 54q-1-19 17-24 19-4 28 11l-4 9q-11-4-20 0-10 7-21 4Z" fill="url(#cap)"/>
          <path d="M101 43q27-6 34 1 2 5-16 10l-19-3Z" fill="#174779"/>
          <path d="M79 50q0-13 14-17l9 5-5 7Z" fill="#f5ebd2" stroke="none"/>
          <path d="m106 60 1 2m1 14q4 2 7-1" stroke="#302118" stroke-width="2.3" fill="none"/>
        </g>
        <path d="M{hands[0]} {hands[1]}L{club[0]} {club[1]}" stroke="#243b35" stroke-width="5.2"/>
        <path d="M{hands[0]} {hands[1]}L{club[0]} {club[1]}" stroke="#c2d1bb" stroke-width="2.1"/>
        <ellipse cx="{club[0]}" cy="{club[1]}" rx="11" ry="5.8" fill="url(#club)" stroke-width="2.2"/>
        <path d="M{shoulder[0]-13} {shoulder[1]-3}Q{elbow[0]-11} {elbow[1]-9} {elbow[0]} {elbow[1]}
          L{hands[0]-3} {hands[1]+3}" fill="none" stroke="#292318" stroke-width="16"/>
        <path d="M{shoulder[0]-13} {shoulder[1]-3}Q{elbow[0]-11} {elbow[1]-9} {elbow[0]} {elbow[1]}
          L{hands[0]-3} {hands[1]+3}" fill="none" stroke="#c78954" stroke-width="10"/>
        <path d="M{shoulder[0]} {shoulder[1]}L{elbow[0]} {elbow[1]}L{hands[0]} {hands[1]}" fill="none" stroke="#292318" stroke-width="16"/>
        <path d="M{shoulder[0]} {shoulder[1]}L{elbow[0]} {elbow[1]}L{hands[0]} {hands[1]}" fill="none" stroke="#edb277" stroke-width="10"/>
        <circle cx="{shoulder[0]}" cy="{shoulder[1]}" r="10" fill="url(#cap)" stroke-width="2.8"/>
        <ellipse cx="{hands[0]}" cy="{hands[1]}" rx="9" ry="7" fill="#fff3d5" stroke-width="2.4"/>
      </g>'''


def swing():
    definitions = ''.join(linear(name, colors) for name, colors in (
        ('bag', ((0, '#ef7e43'), (.46, '#ae3f24'), (1, '#502a24'))),
        ('khaki', ((0, '#efd09c'), (.48, '#b98d58'), (1, '#896135'))),
        ('shirt', ((0, '#fff9e7'), (.66, '#d8e4d4'), (1, '#a8bea7'))),
        ('skin', ((0, '#ffcf91'), (1, '#bd7b41'))),
        ('cap', ((0, '#559bdb'), (.55, '#2764a4'), (1, '#18365f'))),
        ('club', ((0, '#d8dfc4'), (1, '#64746b'))),
        ('shoes', ((0, '#b6d38f'), (1, '#2e6842'))),
    ))
    frames = ''.join(f'<g transform="translate({index*224} 0)">{golfer_pose(*pose)}</g>' for index, pose in enumerate(SWING_POSES))
    return render_svg(1120, 256, frames, definitions)


GENERATED_ART = {
    'multiplier': lambda: golf_ball(gold=True),
    'spin-ball': golf_ball,
    'decor-cart': cart,
    'mascot-swing': swing,
    'swing-trail': swing_trail,
    'hud-wood': wood,
    'studio-plaque': plaque,
    'bonus-sign': lambda: plaque(bonus=True),
    'trophy': trophy,
    'win-rays': glow,
    'win-sparks': sparks,
    'sparkle': lambda: render_svg(96, 96, star(48, 48, 45, '#df932d') + star(48, 48, 34)),
    'confetti': lambda: render_svg(40, 56, '<path d="M9 4q16 8 28 6L25 46Q14 46 4 52Z" fill="#fff3aa" stroke="#924818" stroke-width="4"/><path d="M11 9l19 7-4 9L9 20Z" fill="#ffffff" opacity=".7"/>'),
    'grid-highlight': grid_highlight,
    'firework': firework,
}
