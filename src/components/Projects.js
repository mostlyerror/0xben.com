import React from 'react'
import './Projects.css'

const TechList = ({ tech }) => (
    <ul className="TechList">
      {tech.map(tech => <li>{tech}</li>)}
    </ul>
)

const Project = ({ title, appLink, orgName, orgLink, description, tech }) => (
  <article className="Project">
    <a className="Project-app-link" href={appLink}>
      <h3 className="Project-title">{title}</h3>
    </a>
    <a className="Project-org-link" href={orgLink}>
      <p className="Project-org-name">
        {orgName}
      </p>
    </a>
    <p className="Project-description">{description}</p>
    <TechList tech={tech} />
  </article>
)

const Projects = () => (
  <section id="projects" className="Projects">
    <h2 className="section-title">Projects</h2>
    <ul>
      <li>
        <Project 
          title="Post Acute Care App"
          orgName="The Right Place"
          orgLink="https://therightplace.com"
          description="PAC is a tool used by hundreds of skilled nursing
          facilities to evaluate patients, coordinate and encourage
          collaboration of care teams, and manage bed availability."
          tech={["Rails", "React", "Redux", "Postgres", "AWS", "Docker", "Terraform"]}
        />
      </li>
      <li>
        <Project 
          title="Roverpass.com"
          orgName="RoverPass"
          orgLink="https://roverpass.com"
          description="2-sided marketplace connecting RV campers with campgrounds & parks."
          tech={["Rails", "Angular2", "Postgres", "Linode", "Ansible"]} 
        />
      </li>
      <li>
        <Project 
          title="HRW Mobile App"
          orgName="Houston Restaurant Weeks"
          orgLink="https://apps.apple.com/us/app/houston-restaurant-weeks/id1472340275"
          description=""
          tech={["React Native", "Firebase"]} 
        />
      </li>
    </ul>
  </section>
)

export default Projects