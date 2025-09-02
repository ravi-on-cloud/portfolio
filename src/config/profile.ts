export interface ProjectItem {
  title: string;
  link: string; // repo or article
  preview: string; // live demo or case study
  status: string; // e.g., Deployed, Case Study
  imageUrl?: string; // public path, e.g., /projects/example.png
}

export const profile = {
  name: "Ravi Patel",
  role: "Cloud Engineer",
  tagline:
    "Designing scalable, reliable cloud platforms with Terraform, Kubernetes, and CI/CD.",
  location: "Your City, Your Country",
  email: "ravipatel.2596@gmail.com",
  photoUrl: "/profile.png", // place your PNG at public/profile.png
  github: "https://github.com/ravi-on-cloud",
  linkedin: "https://www.linkedin.com/in/ravipatelpmp/",
  resumeUrl: "",
  contact: {
    // Replace with your Formspree endpoint or leave empty to disable
    formspreeAction: "https://formspree.io/f/your_form_id",
  },
  seo: {
    title: "Ravi Patel — Cloud Engineer",
    description:
      "Cloud Engineer specializing in AWS/Azure/GCP, Terraform, Kubernetes, and DevOps automation.",
    ogImage: "/og.image.png",
    siteUrl: "",
  },
  projects: [
    {
      title: "Spring Petclinic on Azure (Terraform)",
      link: "https://github.com/ravi-on-cloud/spring-petclinic-azure-terraform",
      preview: "https://github.com/ravi-on-cloud/spring-petclinic-azure-terraform",
      status: "Open Source",
      imageUrl: "/projects/spring-diagram.png",
    },
    {
      title: "Azure Multi-Tier Security",
      link: "https://github.com/ravi-on-cloud/azure-multi-tier-security",
      preview: "https://github.com/ravi-on-cloud/azure-multi-tier-security",
      status: "Open Source",
      imageUrl: "/projects/azure-security-diagram.png",
    },
  ] as ProjectItem[],
};

export type Profile = typeof profile;
