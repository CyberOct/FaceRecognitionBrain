import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/facerecognition';
import Navigation from './components/Navigation/navigation';
import SignIn from './components/SignIn/signin';
import Register from './components/Register/register';
import Logo from './components/Logo/logo';
import ImageLinkForm from './components/ImageLinkForm/imagelinkform';
import Rank from './components/Rank/rank';
import './App.css';





const particlesOptions = {
  particles: {
    number: {
      value: 145,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'SignIn',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }


  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined:data.joined
      }
    })
  }

  //* Fetch to check if we see users in web console
 /*  componentDidMount() {
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log)
  } */





  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const height = Number(image.height);
    const width = Number(image.width);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })
    fetch('https://salty-beyond-55664.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          input:this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response) {
          fetch('https://salty-beyond-55664.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
             id: this.state.user.id
            })
          })
          .then(response => response.json() )
          .then(count =>
            {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => {
        console.log(err);
      });
  }

  onRouteChange = (route) => {
    if(route === 'SignOut') {
      
      this.setState(initialState)
    }else if(route === 'home') {
      this.setState({isSignedIn:true})
    }
    this.setState({ route: route });
  }

  render() {
   const {isSignedIn , imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions}>
        </Particles>
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {
          
          route === 'home'
            ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} /> 
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>

            : (
              route === 'SignIn' || route === 'SignOut'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                : <Register loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    )
  };
}

export default App;
