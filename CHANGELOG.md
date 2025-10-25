# Changelog

All notable changes to the AI Tool Finder project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2024-XX-XX

### Fixed
- Fixed issues with the Appearance Settings page where logo uploads were failing
- Improved logo management with better update handling for default, light and dark mode logos
- Fixed authentication checks in backend API endpoints for logo uploads
- Added support for admin access via email domain verification
- Fixed UI refresh issues with the site settings
- Added local storage fallback for logo uploads when Cloudinary is unavailable

### Added
- Added proper meta tags management with Open Graph (OG) image support
- Added visual previews showing how shared links appear on social platforms
- Added a global SiteConfigContext provider for better state management
- Created a useSiteSettings hook with auto-refreshing capabilities
- Implemented a MetaTagsManager component using react-helmet-async
- Added robust file upload system with cloud and local storage options
- Added option to display logo without site name text for cleaner navigation when logo already includes text
- Added dedicated favicon management with preview and instant updates
- Added size recommendations for logos and favicons with helpful guidelines
- Added comprehensive social media integration with Facebook, Twitter, Instagram, LinkedIn, and GitHub links in footer
- Implemented Google Analytics support with automatic page view tracking across the application

### Changed
- Improved error handling and logging for file uploads
- Simplified the Appearance tab in admin settings
- Enhanced authentication flow for admin operations
- Updated documentation with new features
- Removed Features tab from site settings for a more streamlined interface
- Enhanced footer component to display all configured social media links

## [1.0.3] - 2024-XX-XX

### Added
- Initial release on CodeCanyon

## [1.0.2] - 2023-04-15

### Added
- User authentication with Clerk
- Admin dashboard
- Tool submission form

## [1.0.1] - 2023-03-01

### Added
- Initial tool database
- Basic search functionality
- Category browsing

## [1.0.0] - 2023-02-15

### Added
- Initial release
- Landing page
- Basic navigation 