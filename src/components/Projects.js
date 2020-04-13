import React from 'react'
import './Projects.css'

const TechList = ({ tech }) => (
    <ul className="TechList">
      {tech.map(tech => <li>{tech}</li>)}
    </ul>
)

const Project = ({ title, orgName, link, description, tech }) => (
  <article className="Project">
    <h3 className="Project-title">{title}</h3>
    <p className="Project-org">
      <a className="Project-org-link" href={link}>{orgName}</a>
    </p>
    <p className="Project-description">{description}</p>
    <TechList tech={tech} />
  </article>
)

const Projects = () => (
  <section className="Projects">
    <h2>Projects</h2>
    <ul>
      <li>
        <Project 
          title="Post Acute Care App"
          orgName="The Right Place"
          link="therightplace.com"
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
          link="roverpass.com"
          description="2-sided marketplace connecting RV campers with campgrounds & parks."
          tech={["Rails", "Angular2", "Postgres", "Linode", "Ansible"]} 
        />
      </li>
      <li>
        <Project 
          title="HRW Mobile App"
          org="Houston Restaurant Weeks"
          link=""
          description=""
          tech={["asdf", "asdf"]} 
        />
      </li>
    </ul>
  </section>
)

export default Projects