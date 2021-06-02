import React from 'react';
import { NavLink } from 'react-router-dom';
import {Button, Container} from 'semantic-ui-react';
import './css/Navigation.css'

const Navigation = () => {
    return (
       <Container id='NavBar'>
            <NavLink to="/">
                <Button type="button">
                        Home
                </Button> 
            </NavLink>
            <NavLink to="/about">
                <Button type="button">
                        About
                </Button> 
            </NavLink>
       </Container>
    );
}
 
export default Navigation;