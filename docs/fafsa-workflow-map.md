# AidPilot FAFSA Workflow Map

## Purpose

This document maps the student financial aid journey into product states, tasks, reminders, and dashboard logic. AidPilot should help students know where they are, what is at risk, and what to do next.

## Safety note

AidPilot does not submit FAFSA forms, does not connect to FAFSA accounts, does not collect FAFSA login credentials, does not collect Social Security numbers, and does not store tax documents. AidPilot helps students organize the process and understand what to do next.

## Phase 1: Before FAFSA opens

**Goal:** Prepare the student and contributors.

**Student tasks:**

- Create or confirm StudentAid.gov account
- Identify contributors
- Ask parent or spouse contributor to create their own StudentAid.gov account if needed
- Confirm legal name and date of birth match official records
- Gather school list
- Gather basic income and asset information
- Check state and school priority deadlines

**AidPilot product state:** Not started

**AidPilot reminders:**

- Create StudentAid.gov account
- Confirm contributor information
- Add state and school deadlines
- Build your school list

## Phase 2: Start FAFSA

**Goal:** Begin the form and complete student sections.

**Student tasks:**

- Start FAFSA form on StudentAid.gov
- Enter student identity information
- Enter state of residence
- Answer dependency questions
- Add schools
- Invite contributor if required

**AidPilot product state:** In progress

**AidPilot reminders:**

- Invite contributor
- Add all schools
- Save confirmation that FAFSA has been started

## Phase 3: Contributor completion

**Goal:** Make sure all required people complete their sections.

**Student tasks:**

- Confirm contributor received invite
- Contributor logs in with their own account
- Contributor provides consent and approval
- Contributor signs their section

**AidPilot product state:** Waiting on contributor

**AidPilot reminders:**

- Parent contributor not done
- Spouse contributor not done
- Consent and approval required
- FAFSA may be incomplete until all contributors sign

## Phase 4: Submit FAFSA

**Goal:** Submit the FAFSA and save proof.

**Student tasks:**

- Review answers
- Sign
- Submit
- Save confirmation page
- Record submission date

**AidPilot product state:** Submitted

**AidPilot reminders:**

- Save confirmation
- Check FAFSA status
- Watch for school portal updates

## Phase 5: Review FAFSA Submission Summary

**Goal:** Catch errors and understand next steps.

**Student tasks:**

- Review FAFSA Submission Summary
- Check Student Aid Index
- Check Pell Grant estimate
- Check listed schools
- Check next steps
- Make corrections if needed

**AidPilot product state:** Needs review

**AidPilot reminders:**

- Review FAFSA Submission Summary
- Make corrections if needed
- Add or remove schools if needed

## Phase 6: State aid and Cal Grant

**Goal:** Complete state aid requirements.

**Student tasks:**

- Check California Student Aid Commission deadlines if California student
- Confirm Cal Grant GPA verification if applicable
- Log into WebGrants 4 Students if applicable
- Check state aid status
- Complete CADAA instead of FAFSA if applicable

**AidPilot product state:** State aid review

**AidPilot reminders:**

- Cal Grant priority deadline
- GPA verification needed
- WebGrants status check
- CADAA path if applicable

## Phase 7: School financial aid portal

**Goal:** Complete institution-specific requirements.

**Student tasks:**

- Log into school aid portal
- Review requested documents
- Complete verification if selected
- Submit forms requested by school
- Check residency requirements
- Check satisfactory academic progress requirements
- Monitor messages

**AidPilot product state:** School review

**AidPilot reminders:**

- Missing document
- Verification selected
- Portal message waiting
- Residency status needed
- Satisfactory academic progress warning

## Phase 8: Aid offer review

**Goal:** Understand grants, scholarships, work-study, and loans.

**Student tasks:**

- Review aid offer
- Identify grants and scholarships
- Decide on work-study
- Decide on loans
- Complete entrance counseling if accepting loans
- Sign master promissory note if needed
- Compare out-of-pocket cost

**AidPilot product state:** Offer review

**AidPilot reminders:**

- Review aid offer
- Accept grants
- Decide on work-study
- Review loan offer
- Complete entrance counseling
- Sign master promissory note

## Phase 9: Ongoing aid protection

**Goal:** Keep aid protected after the semester starts.

**Student tasks:**

- Maintain enrollment status
- Maintain satisfactory academic progress
- Report outside scholarships
- Watch refund timing
- Keep documents updated
- Prepare for next FAFSA cycle

**AidPilot product state:** Protected

**AidPilot reminders:**

- Enrollment status check
- Satisfactory academic progress check
- Outside scholarship reporting
- Refund timing
- Next FAFSA cycle

## AidPilot status model

- Not started
- In progress
- Waiting on contributor
- Submitted
- Needs review
- State aid review
- School review
- Offer review
- Protected
- At risk

## Risk signals

- FAFSA not submitted
- Contributor not complete
- Consent and approval missing
- School portal has requested documents
- Verification selected
- Cal Grant GPA verification missing
- Aid offer not reviewed
- Loan steps incomplete
- Satisfactory academic progress issue
- Enrollment status below required level
- Deadline within 7 days
- Deadline missed
- Student has not checked school portal
- Missing document requested by school
- Aid offer changed

## Dashboard logic

**Protected:** No high-priority tasks due within 7 days and no missing required documents.

**Needs attention:** One or more tasks due within 14 days.

**At risk:** Deadline missed, missing required document, contributor incomplete, verification unresolved, enrollment issue, or satisfactory academic progress issue.

## MVP scope

**AidPilot v0.2 can:**

- Track status manually
- Save student profile
- Save tasks
- Save document statuses
- Save scholarship matches
- Show weekly report
- Let users mark tasks complete
- Let users save scholarships
- Let users mark scholarships as started
- Show aid status based on task and document state

**AidPilot v0.2 cannot:**

- Submit FAFSA
- Log into FAFSA
- Pull official aid data automatically
- Store tax documents
- Store Social Security numbers
- Guarantee aid
- Guarantee scholarships
- Replace a financial aid office

## How this improves AidPilot

This workflow map gives AidPilot its product logic. The dashboard should not be a generic task list. It should understand what phase of the financial aid journey the student is in, what could put aid at risk, and what the next best action is.
