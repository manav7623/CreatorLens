import os
from fpdf import FPDF

class WorkflowPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            # Header top band
            self.set_fill_color(79, 70, 229) # Indigo
            self.rect(0, 0, 210, 8, "F")
            
            # Header text
            self.set_y(10)
            self.set_font("helvetica", "B", 8)
            self.set_text_color(71, 85, 105) # Slate grey
            self.cell(0, 5, "COLLABBRIDGE - SYSTEM WORKFLOW & INTEGRATION GUIDE", 0, 0, "L")
            self.cell(0, 5, "CONFIDENTIAL", 0, 1, "R")
            
            # Thin line below header
            self.set_draw_color(226, 232, 240)
            self.set_line_width(0.5)
            self.line(15, 16, 195, 16)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            # Thin line above footer
            self.set_draw_color(226, 232, 240)
            self.set_line_width(0.5)
            self.line(15, 282, 195, 282)
            
            # Footer text
            self.set_y(-12)
            self.set_font("helvetica", "", 8)
            self.set_text_color(148, 163, 184) # Light slate
            self.cell(0, 5, "Copyright (c) 2026 CollabBridge Inc. All rights reserved.", 0, 0, "L")
            self.cell(0, 5, f"Page {self.page_no()}", 0, 1, "R")

    def add_section_header(self, title):
        self.set_font("helvetica", "B", 14)
        self.set_text_color(30, 27, 75) # Dark Indigo
        self.cell(0, 8, title, 0, 1, "L")
        
        # Horizontal accent line
        self.set_draw_color(79, 70, 229) # Indigo
        self.set_line_width(1)
        self.line(self.get_x(), self.get_y(), self.get_x() + 45, self.get_y())
        self.ln(4)

    def add_paragraph(self, text, style="", size=10, ln_height=5):
        self.set_font("helvetica", style, size)
        self.set_text_color(71, 85, 105) # Slate text
        self.multi_cell(0, ln_height, text, 0, "L")
        self.ln(2)

    def add_bullet(self, title, description):
        self.set_font("helvetica", "B", 10)
        self.set_text_color(79, 70, 229) # Indigo bullet
        self.write(5, "-  ")
        self.set_font("helvetica", "B", 10)
        self.set_text_color(30, 27, 75) # Dark text
        self.write(5, title + ": ")
        self.set_font("helvetica", "", 10)
        self.set_text_color(71, 85, 105) # Slate text
        self.multi_cell(0, 5, description, 0, "L")
        self.ln(1.5)

def create_guide_pdf():
    pdf = WorkflowPDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(15, 20, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ----------------------------------------------------
    # PAGE 1: COVER PAGE
    # ----------------------------------------------------
    pdf.add_page()
    
    # Background accents
    pdf.set_fill_color(30, 27, 75) # Deep Dark Indigo
    pdf.rect(0, 0, 210, 120, "F")
    
    pdf.set_y(25)
    pdf.set_font("helvetica", "B", 28)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, "CollabBridge", 0, 1, "C")
    
    pdf.set_font("helvetica", "", 14)
    pdf.set_text_color(196, 181, 253) # Light purple accent
    pdf.cell(0, 10, "AI-Powered Brand & Creator Collaboration Platform", 0, 1, "C")
    
    pdf.ln(15)
    
    # Cover illustration
    cover_img = "screenshots/cover_illustration.png"
    if os.path.exists(cover_img):
        pdf.image(cover_img, x=25, y=55, w=160, h=100)
    
    # Title Text in light section
    pdf.set_y(165)
    pdf.set_font("helvetica", "B", 20)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 10, "System Workflow & Integration Guide", 0, 1, "C")
    
    # Divider
    pdf.set_draw_color(79, 70, 229)
    pdf.set_line_width(1.5)
    pdf.line(75, 178, 135, 178)
    pdf.ln(15)
    
    pdf.set_y(195)
    pdf.set_font("helvetica", "", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, "A comprehensive, step-by-step handbook covering authentication,", 0, 1, "C")
    pdf.cell(0, 6, "brand campaign setups, creator profiles, AI scoring and auditing metrics.", 0, 1, "C")
    
    # Footer metadata on Cover Page
    pdf.set_y(245)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 5, "PLATFORM DOCUMENTATION V1.0", 0, 1, "C")
    
    pdf.set_font("helvetica", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Date: August 2026  |  Author: CollabBridge Product Engineering Team", 0, 1, "C")

    # ----------------------------------------------------
    # PAGE 2: TABLE OF CONTENTS & INTRODUCTION
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("Table of Contents")
    pdf.ln(2)
    
    # TOC table mock
    toc_items = [
        ("1. Platform Introduction & Tech Stack", "Page 2"),
        ("2. Core System Architecture & API Schema", "Page 3"),
        ("3. Brand Workflow: Campaigns & Search", "Page 4"),
        ("4. Brand Workflow: AI Profile Analysis", "Page 5"),
        ("5. Creator Workflow: Profiles & Applications", "Page 6"),
        ("6. Collaboration & Real-Time Messaging", "Page 7"),
        ("7. Administrative Oversight & Auditing", "Page 8"),
    ]
    
    for title, page in toc_items:
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(30, 27, 75)
        pdf.cell(140, 6, title, 0, 0, "L")
        pdf.set_font("helvetica", "", 10)
        pdf.set_text_color(148, 163, 184)
        pdf.cell(0, 6, "." * 35 + " " + page, 0, 1, "R")
    
    pdf.ln(8)
    
    pdf.add_section_header("1. Platform Introduction")
    pdf.ln(2)
    pdf.add_paragraph(
        "CollabBridge is a state-of-the-art marketing collaboration marketplace connecting brands with influential creators. "
        "The platform resolves standard friction points in influencer marketing by embedding verification, real-time messaging, "
        "dispute-free milestone tracking, and advanced AI-driven profile analytics."
    )
    
    pdf.add_paragraph(
        "Brands use the platform to post detailed campaign requests (budgets, deliverables, rules), and find matching creators. "
        "Creators join to establish a digital media kit, discover paid work, apply to active campaigns, and collaborate securely. "
        "Administrators supervise the ecosystem, vetting creators and monitoring campaigns for compliance."
    )
    
    pdf.ln(4)
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Technology Stack Details", 0, 1, "L")
    pdf.ln(1)
    
    tech_stack = [
        ("Frontend Application", "Next.js 14, React Redux Toolkit, Tailwind CSS, Recharts for analytics UI."),
        ("Backend Services", "Node.js (Express), Node-Mailer for alerts, Socket.io for persistent chat channels."),
        ("Database Engine", "MySQL managed via Sequelize ORM with fully normalized relationship models."),
        ("AI Core Systems", "Custom JavaScript algorithm analyzing engagement, consistency, and location metrics.")
    ]
    
    for title, desc in tech_stack:
        pdf.add_bullet(title, desc)

    # ----------------------------------------------------
    # PAGE 3: SYSTEM ARCHITECTURE & API SCHEMA
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("2. Core System Architecture")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "CollabBridge is structured around five primary relational entities: Users, Campaigns, Applications, Messages, and Payments. "
        "A relational MySQL schema ensures referential integrity across registrations, applications, and payments."
    )
    
    pdf.ln(2)
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Key Core Database Entities", 0, 1, "L")
    pdf.ln(1)
    
    entities = [
        ("Users", "Stores credentials, profile info, bio, social links, role (brand/creator/admin) and AI ratings."),
        ("Campaigns", "Holds brand campaign definitions, budget, deliverables, platform requirements, and status."),
        ("Applications", "Tracks creator applications to campaigns, including pitches, bids, and states (pending/accepted)."),
        ("Messages", "Stores persistent chat history between brands and creators, complete with socket indicators."),
        ("Payments", "Manages contract terms, total deposit, milestone values, and releases via escrow.")
    ]
    for title, desc in entities:
        pdf.add_bullet(title, desc)
        
    pdf.ln(4)
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Core REST API Router References", 0, 1, "L")
    pdf.ln(2)
    
    # API endpoints table
    # Columns: Method, Endpoint, Description
    col_widths = [20, 75, 75]
    row_height = 6
    
    # Table Header
    pdf.set_fill_color(79, 70, 229) # Indigo
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 9)
    pdf.cell(col_widths[0], row_height, "Method", 1, 0, "C", True)
    pdf.cell(col_widths[1], row_height, "API Endpoint", 1, 0, "L", True)
    pdf.cell(col_widths[2], row_height, "Purpose & Action Scope", 1, 1, "L", True)
    
    # Table Rows
    pdf.set_fill_color(248, 250, 252) # Off white
    pdf.set_text_color(71, 85, 105)
    pdf.set_font("helvetica", "", 8)
    
    api_routes = [
        ("POST", "/api/auth/register", "Register creator, brand, or admin profile"),
        ("POST", "/api/auth/login", "Authenticate profile, return JWT authorization token"),
        ("GET", "/api/users/creators", "Query list of creators with platform & rating filters"),
        ("POST", "/api/users/analyze/:id", "Trigger background AI profile validation score"),
        ("POST", "/api/campaigns", "Create new brand campaign proposal"),
        ("POST", "/api/applications", "Submit creator campaign application & bid"),
        ("GET", "/api/messages/:id", "Retrieve historical chat logs for chat session"),
        ("PUT", "/api/admin/users/:id/verify", "Mark creator profile verified by admin audit")
    ]
    
    fill = False
    for method, path, desc in api_routes:
        pdf.cell(col_widths[0], row_height, method, 1, 0, "C", fill)
        pdf.cell(col_widths[1], row_height, path, 1, 0, "L", fill)
        pdf.cell(col_widths[2], row_height, desc, 1, 1, "L", fill)
        fill = not fill

    # ----------------------------------------------------
    # PAGE 4: BRAND WORKFLOW - CREATOR SEARCH
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("3. Brand Workflow: Finding Creators")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "A brand's journey begins with creator discovery. CollabBridge provides an advanced search engine "
        "allowing brand managers to filter candidates by social platform, main category (gaming, beauty, tech, fashion), "
        "minimum follower count, and target AI quality score. This ensures brands find exact fits for their niches."
    )
    
    # Creator search mockup image
    search_img = "screenshots/creator_search.png"
    if os.path.exists(search_img):
        pdf.image(search_img, x=20, y=45, w=170, h=105)
        pdf.ln(112)
        
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Figure 1. Creator discovery search portal showing filtering options and rating cards.", 0, 1, "C")
    pdf.ln(3)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Creator Search Features & Metrics:", 0, 1, "L")
    pdf.ln(1)
    
    pdf.add_bullet("Granular Niche Filters", "Instantly narrow down search results to specific niches (e.g., Tech or Beauty).")
    pdf.add_bullet("Aggregated Scoring", "Review aggregated ratings based on past campaigns, rating stars, and completed contracts.")
    pdf.add_bullet("Verification Badges", "Differentiate between standard user registrations and verified platform creators.")

    # ----------------------------------------------------
    # PAGE 5: BRAND WORKFLOW - AI PROFILE ANALYSIS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("4. Brand Workflow: AI Profile Analysis")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "To protect brands from fraudulent accounts and inflated metrics, CollabBridge includes a built-in AI Analysis system. "
        "When a brand views a creator profile, they can trigger an live AI audit. The system reviews the creator's social links, "
        "and aggregates performance metrics to calculate an overall quality score (0 to 100)."
    )
    
    # Brand dashboard or campaign mockups (using brand_dashboard)
    bd_img = "screenshots/brand_dashboard.png"
    if os.path.exists(bd_img):
        pdf.image(bd_img, x=20, y=45, w=170, h=105)
        pdf.ln(112)
        
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Figure 2. Brand dashboard UI detailing campaign progress, total budget spent, and key metrics.", 0, 1, "C")
    pdf.ln(3)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "AI Analysis Audit Metrics Explained:", 0, 1, "L")
    pdf.ln(1)
    
    pdf.add_bullet("Engagement Rate", "Evaluates historical likes/comments against follower counts to detect active audience ratio.")
    pdf.add_bullet("Audience Authenticity", "Uses profile verification heuristics to estimate the percentage of real vs fake followers.")
    pdf.add_bullet("Posting Consistency", "Measures active posting schedules to determine if creator keeps up an active presence.")
    pdf.add_bullet("Audience Demographics", "Extracts geographical distribution details to match brand campaign target regions.")

    # ----------------------------------------------------
    # PAGE 6: BRAND WORKFLOW - CAMPAIGN CREATION
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("5. Brand Workflow: Campaign Posting")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "Posting a campaign allows brands to invite applications passively. The creator dashboard lists active campaign briefs, "
        "enabling creators to review parameters and pitches. Brands write clear requirements and define structured compensation terms."
    )
    
    # Campaign creation image
    create_img = "screenshots/campaign_creation.png"
    if os.path.exists(create_img):
        pdf.image(create_img, x=20, y=45, w=170, h=105)
        pdf.ln(112)
        
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Figure 3. Campaign setup form interface detailing budgets, channels, and briefs.", 0, 1, "C")
    pdf.ln(3)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Key Campaign Parameters:", 0, 1, "L")
    pdf.ln(1)
    
    pdf.add_bullet("Deliverables Brief", "Detailed text instructions specifying what the creator needs to produce (videos, posts).")
    pdf.add_bullet("Budget Allocation", "Brands specify a total budget, which will be held in platform escrow during collaboration.")
    pdf.add_bullet("Platform Selection", "Specify which social channels (e.g. YouTube, Instagram) the promotion must run on.")

    # ----------------------------------------------------
    # PAGE 7: CREATOR WORKFLOW - APPLICATION & DASHBOARD
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("6. Creator Workflow: Applying & Earning")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "Creators log in to a tailored view highlighting active campaigns matching their category. "
        "From their dashboard, creators submit customized pitch messages, request specific budgets (which can "
        "be counter-proposed), track pending bids, and monitor active campaign earnings milestones."
    )
    
    # Creator dashboard image
    creator_img = "screenshots/creator_dashboard.png"
    if os.path.exists(creator_img):
        pdf.image(creator_img, x=20, y=45, w=170, h=105)
        pdf.ln(112)
        
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Figure 4. Creator dashboard interface displaying monthly earnings, active milestones, and applications.", 0, 1, "C")
    pdf.ln(3)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Creator Application Lifecycle:", 0, 1, "L")
    pdf.ln(1)
    
    pdf.add_bullet("Explore Briefs", "Browse list of active campaigns, searching by platform tags or keyword filters.")
    pdf.add_bullet("Submit Pitch", "Write a proposal letter outlining creative ideas, adding links to past portfolio pieces.")
    pdf.add_bullet("Milestone Trackers", "Upon application acceptance, view active contract phases, submissions, and payments.")

    # ----------------------------------------------------
    # PAGE 8: CHAT INTERFACE & ADMIN PANEL
    # ----------------------------------------------------
    pdf.add_page()
    pdf.ln(5)
    pdf.add_section_header("7. Messaging & Administrative Control")
    pdf.ln(2)
    
    pdf.add_paragraph(
        "CollabBridge integrates a real-time messaging system built on Socket.io. This enables prompt negotiations, "
        "asset reviews, and active progress reporting. The system also includes an administrative oversight panel. "
        "Admins can review registered users, issue creator verification badges, ban bad actors, and resolve open campaign disputes."
    )
    
    # Chat mockup and Admin mockup next to each other or stacked
    # Let's stack them nicely (or put chat image and describe)
    chat_img = "screenshots/chat_interface.png"
    if os.path.exists(chat_img):
        pdf.image(chat_img, x=15, y=45, w=85, h=53)
        
    admin_img = "screenshots/admin_panel.png"
    if os.path.exists(admin_img):
        pdf.image(admin_img, x=108, y=45, w=85, h=53)
        
    pdf.ln(57)
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "Figure 5. Left: Chat interface for direct messages. Right: Platform Admin Oversight dashboard.", 0, 1, "C")
    pdf.ln(3)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 6, "Collaboration and Management Channels:", 0, 1, "L")
    pdf.ln(1)
    
    pdf.add_bullet("Socket.io Instant Chats", "Real-time, low-latency text channels for creators and brands to negotiate terms.")
    pdf.add_bullet("User Moderation Engine", "Admin console enabling single-click creator profile verification and user banning.")
    pdf.add_bullet("Platform Statistics Panel", "High-level metrics tracking total system revenue, registrations, and chats.")
    
    pdf.ln(4)
    # Highlight block
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(79, 70, 229)
    pdf.set_line_width(0.5)
    pdf.rect(15, 180, 180, 20, "DF")
    pdf.set_xy(18, 182)
    pdf.set_font("helvetica", "B", 8)
    pdf.set_text_color(30, 27, 75)
    pdf.cell(0, 4, "IMPORTANT INTEGRATION RUNTIME NOTE", 0, 1, "L")
    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(71, 85, 105)
    pdf.set_x(18)
    pdf.multi_cell(174, 4, "Before running the admin verification or initiating chat sockets, ensure that node seed.js has successfully completed execution to provision demo credentials in the local MySQL instance.", 0, "L")

    # Output file
    output_path = "CollabBridge_Workflow_Guide.pdf"
    pdf.output(output_path)
    print(f"✅ Workflow PDF generated successfully: {output_path}")

if __name__ == "__main__":
    create_guide_pdf()
