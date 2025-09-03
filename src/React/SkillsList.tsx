import React, { useState } from "react";

const CategoryIcons = {
  "Cloud Platforms": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-[var(--sec)] opacity-70"
    >
      <path d="M7 18H17C19.7614 18 22 15.7614 22 13C22 10.5055 20.1636 8.41726 17.7778 8.06667C16.8879 5.70529 14.6113 4 12 4C8.68629 4 6 6.68629 6 10C3.79086 10 2 11.7909 2 14C2 16.2091 3.79086 18 6 18H7Z"></path>
    </svg>
  ),
  "Infrastructure as Code": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-[var(--sec)] opacity-70"
    >
      <path d="M20 7H4V5H20V7ZM4 9H14V11H4V9ZM4 13H20V15H4V13ZM4 17H14V19H4V17Z"></path>
    </svg>
  ),
  "Containers & Orchestration": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-[var(--sec)] opacity-70"
    >
      <path d="M3 7H21V9H3V7ZM3 11H21V13H3V11ZM3 15H21V17H3V15Z"></path>
    </svg>
  ),
};

const SkillsList = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const skills = {
    "Cloud Platforms": [
      "AWS, Azure, GCP (multi-cloud)",
      "Networking: VPC/VNet, Transit Gateway, DNS",
      "Identity: IAM/AAD, SSO, RBAC",
    ],
    "Infrastructure as Code": [
      "Terraform modules, Terragrunt, state mgmt",
      "CloudFormation/Bicep, policy as code",
      "GitOps with Argo CD/Flux",
    ],
    "Containers & Orchestration": [
      "Docker, Kubernetes (EKS/AKS/GKE)",
      "Ingress, Service Mesh (Istio/Linkerd)",
      "Helm, Kustomize, operators",
    ],
  };

  const toggleItem = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  return (
    <div className="text-left pt-3 md:pt-9">
      <h3 className="text-[var(--white)] text-3xl md:text-4xl font-semibold md:mb-6">
        What I do?
      </h3>
      <ul className="space-y-4 mt-4 text-lg">
        {Object.entries(skills).map(([category, items]) => (
          <li key={category} className="w-full">
            <div
              onClick={() => toggleItem(category)}
              className="md:w-[400px] w-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded-2xl text-left transition-all border border-[var(--border-muted)] cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                {CategoryIcons[category]}
                <div className="flex items-center gap-2 flex-grow justify-between">
                  <div className="min-w-0 max-w-[200px] md:max-w-none overflow-hidden">
                    <span className="block truncate text-[var(--white)] text-lg">
                      {category}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-6 h-6 text-[var(--white)] transform transition-transform flex-shrink-0 ${
                      openItem === category ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
                  </svg>
                </div>
              </div>

              <div
                className={`transition-all duration-300 px-4 ${
                  openItem === category
                    ? "max-h-[500px] pb-4 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <ul className="space-y-2 text-[var(--white-icon)] text-sm">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="pl-1">•</span>
                      <li className="pl-3">{item}</li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsList;
