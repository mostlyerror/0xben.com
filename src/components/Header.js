import React from "react"
import { FaTwitter, FaGithubAlt } from "react-icons/fa"
import Nav from './Nav'

import './Header.css'

const Social = () => {
  return (
    <div></div>
  )
}

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
      </div>

      <Nav />

      <Social />

      <ul
        style={{
          minWidth: 300,
          maxWidth: 350,
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 32,
          width: "100%",
        }}
      >
        <li style={{ display: "flex", alignItems: "center" }}>
          <img
            src="./ben_head_orange.png"
            width={48}
            height={48}
            style={{ filter: "grayscale(100%)", borderRadius: "50%" }}
            alt="photo of Ben"
          />
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <FaTwitter color="white" size="25" />
          <span style={{ marginLeft: 14, color: "white", fontSize: 16 }}>
            Twitter
          </span>
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <FaGithubAlt color="white" size="25" />
          <span style={{ marginLeft: 14, color: "white", fontSize: 16 }}>
            Github
          </span>
        </li>
      </ul>
    </section>
  )
}

export default Header
