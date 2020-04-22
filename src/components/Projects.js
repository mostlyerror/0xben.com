import React from 'react'
import './Projects.css'

const TechList = ({ tech }) => (
    <ul className="tech-list">
      {tech.map(tech => <li>{tech}</li>)}
    </ul>
)

const Project = ({ title, appLink, orgName, orgLink, description, tech }) => (
  <article>
    <a className="app-link" href={appLink}>
      <h3 className="title">{title}</h3>
    </a>
    <a className="org-link" href={orgLink}>
      <p className="org-name">
        {orgName}
      </p>
    </a>
    <p className="description">{description}</p>
    <TechList tech={tech} />
  </article>
)

const Projects = () => (
  <section id="projects" className="projects">
    <h2 className="section-title">Projects</h2>
    <ul>
      <li className="item">
        <Project 
          orgName="The Right Place"
          orgLink="https://therightplace.com"
          title="Post Acute Care"
          description="Used by hundreds of skilled nursing
          facilities to evaluate patients, coordinate and encourage
          collaboration of care teams, and manage bed availability."
          tech={["Rails", "React", "Redux", "Postgres", "AWS", "Docker", "Terraform"]}
        />
      </li>
      <li className="item">
        <Project 
          orgName="RoverPass"
          orgLink="https://roverpass.com"
          title="Roverpass.com"
          description="Web marketplace connecting RV campers with campgrounds & parks."
          tech={["Rails", "Angular2", "Postgres", "Linode", "Ansible"]} 
        />
      </li>
      <li className="item">
        <Project 
          orgName="Houston Restaurant Weeks"
          orgLink="https://apps.apple.com/us/app/houston-restaurant-weeks/id1472340275"
          title="Restaurant Discovery"
          description="lorem ipsum blah blah"
          tech={["React Native", "Firebase"]} 
        />
      </li>
    </ul>
  </section>
)

export default Projects