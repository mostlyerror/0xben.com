import React from "react"
import Nav from './Nav'
import Social from './Social'

import './Header.css'

function Header() {
  return (
    <section className="Header">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>Hello, I'm Ben Poon. 👋</h1>
        <p style={{ marginTop: "3.2em" }}>
          I'm a full stack web developer currently building SaaS products for
          the healthcare industry. I prefer to dip my toes in many things from
          UX to API development to database performance tuning. Lately I've been
          learning a bit more about ReactJS and modern frontend development.
        </p>
        <p style={{ marginTop: "1em" }}>
          I'm open to any interesting project (and I find a whole lotta things
          interesting).
        </p>
        <Nav />
      </div>
      <Social />
    </section>
  )
}

export default Header
