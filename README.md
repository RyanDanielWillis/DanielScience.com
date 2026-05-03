# DanielScience

DanielScience is a static portfolio and consulting website for infrastructure, software, automation, and VoIP-focused technical services. The site is designed to help recruiters, employers, and business leaders quickly understand the value behind the brand and review project proof, service positioning, pricing, and contact information.[cite:73][cite:232]

## What this site is for

- Present a professional technical brand that is safe to share with employers and useful for recruiters.[cite:73]
- Support contract work, stronger job opportunities, and long-term consulting growth.[cite:73]
- Show proof through projects such as Angry VoIP Scanner.[cite:30]

## What DanielScience can do

- Infrastructure support and systems improvement.[cite:31]
- Custom software and automation delivery.[cite:109]
- VoIP diagnostics, troubleshooting, and related technical consulting.[cite:30][cite:31]
- Technical communication that works for both leadership and hands-on teams.[cite:73]

## Site pages

- `index.html` — homepage and positioning
- `services.html` — service categories
- `project-case-studies.html` — project proof and case study structure
- `pricing.html` — starter pricing ranges
- `resume.html` — professional profile and role fit
- `contact.html` — contact paths for recruiters and business leaders

## Deployment

This project is intended to be deployed as a static site to the main domain root:

```bash
/var/www/danielscience.com
```

The included GitHub Actions workflow deploys the site to a VPS over SSH and `rsync`, while the VoIP Scanner stays on its own subdomain at `voipscan.danielscience.com`.[cite:30]

## Nginx notes

- `nginx-main.conf` serves `danielscience.com` and `www.danielscience.com`
- `nginx-voipscan.conf` proxies `voipscan.danielscience.com` to the scanner app backend
