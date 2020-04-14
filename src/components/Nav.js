import React from "react"

import './Nav.css'

function Nav() {
  return (
    <nav className="Nav">
      <ul>
        <li>
          <a href="#projects">
            <span>01</span>
            <span></span>
            <span>Projects</span>
          </a>
        </li>
        <li>
          <a href="#skills">
            <span>02</span>
            <span></span>
            <span>Skills & Interests</span>
          </a>
        </li>
        <li>
          <a href="#thoughts">
            <span>03</span>
            <span></span>
            <span>Thoughts</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
