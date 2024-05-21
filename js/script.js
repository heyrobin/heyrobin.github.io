document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-button');
    const projects = document.querySelectorAll('.project');
  
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove 'active' class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
  
            // Add 'active' class to the clicked button
            this.classList.add('active');
  
            const filterValue = this.getAttribute('data-filter');
            filterProjects(filterValue);
        });
    });
  
    function filterProjects(filter) {
        projects.forEach(project => {
            const projectFilters = project.getAttribute('class').split(' ');
            if (filter === 'all' || projectFilters.includes(filter)) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    }
  });