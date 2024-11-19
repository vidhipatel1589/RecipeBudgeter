//hide other pages when switching through pages on nav bar
export function showSection(sectionId) {
    //get sections
    const sections = document.querySelectorAll('.section');

    //hide other sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    //show selected section
    document.getElementById(sectionId).style.display = 'block';
}