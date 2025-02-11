// src/Page.js
import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, ListGroup } from "react-bootstrap";

// Service to fetch data
async function fetchData(subdomain) {
    try {
        const response = await fetch(`http://16.170.235.27:5000/api/websiteinfo?subdomain=${subdomain}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return null;
    }
}

function Page({ name }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData(name).then(setData);
    }, []);

    if (!data) return <div>Loading...</div>;

    // Parse JSON data for complex fields
    const navItems = JSON.parse(data.navItems) || [];
    const landing = JSON.parse(data.landing) || [];
    const services = JSON.parse(data.services) || [];
    const testimonials = JSON.parse(data.testimonials) || [];
    const galleryItems = JSON.parse(data.gallery) || [];
    const contact = JSON.parse(data.contact) || [];

    return (
        <div>
            {/* Navigation Section */}
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">My Website</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {navItems.map((item, index) => (
                            <Nav.Link href={`#${item}`} key={index}>
                                {item}
                            </Nav.Link>
                        ))}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            {/* Landing Section */}

            <Container>
                <h1>{landing.header}</h1>
                <p>{landing.paragraph}</p>
            </Container>


            {/* About Section */}
            <Container>
                <h2>About</h2>
                <p>{data.about}</p>
            </Container>

            {/* Services Section */}
            <Container>
                <h2>Services</h2>
                <ListGroup>
                    {services.map((service, index) => (
                        <ListGroup.Item key={index}>{service}</ListGroup.Item>
                    ))}
                </ListGroup>
            </Container>

            {/* Testimonials Section */}
            <Container>
                <h2>Testimonials</h2>
                <ListGroup>
                    {testimonials.map((testimonial, index) => (
                        <ListGroup.Item key={index}>{testimonial}</ListGroup.Item>
                    ))}
                </ListGroup>
            </Container>

            {/* Gallery Section */}
            <Container>
                <h2>Gallery</h2>
                {galleryItems.length > 0 ? (
                    <div>{/* Display gallery images if available */}</div>
                ) : (
                    <p>No images available.</p>
                )}
            </Container>

            {/* Contact Section */}
            <Container>
                <h2>Contact Us</h2>
                <p>Email: {contact.email}</p>
                <p>Phone: {contact.phone}</p>
                <p>Message: {contact.message}</p>
            </Container>

            {/* Footer Section */}
            <footer>
                <Container>
                    <p>{data.footer || "Footer content goes here."}</p>
                </Container>
            </footer>
        </div>
    );
}

export default Page;
