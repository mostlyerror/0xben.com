import React from 'react'
import './Skills.css'

const Skills = () => (
  <section id="skills">
    <h2 className="section-title">Skills & Interests</h2>
    <ul>
      <li className="item">
        <h3>Worked With</h3>
        <ul className="tech-list">
          <li>Ruby on Rails</li>
          <li>RSpec</li>
          <li>React.js</li>
          <li>Redux</li>
          <li>Node.js</li>
          <li>Express.js</li>
          <li>Postgres</li>
          <li>Redis</li>
          <li>AWS</li>
        </ul>
      </li>
      <li className="item">
        <h3>Interested In</h3>
        <ul className="tech-list">
          <li>Elixir (Phoenix)</li>
          <li>Svelte.js</li>
          <li>Jest/Enzyme</li>
          <li>React Hooks</li>
          <li>React Context</li>
          <li>Event Sourcing / DDD</li>
          <li>Golang</li>
        </ul>
      </li>
    </ul>
  </section>
)

export default Skills