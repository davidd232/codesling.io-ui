import React, { Component } from 'react';
import randomstring from 'randomstring';
import axios from 'axios';
import io from 'socket.io-client/dist/socket.io.js';

import Button from '../globals/Button';
import Logo from '../globals/Logo';
import Input from '../globals/forms/Input';

import './LandingPage.css';

let slingId;

class Home extends Component {
  state = {
    allChallenges: [],
    selectedChallenge: {},
    username: localStorage.username,
    socket: null,
    room: '',
    sharedURL: null
  }

  componentWillMount() {
    this.socket = io('http://localhost:4155', {
      query: {
        roomId: this.props.location.pathname.slice(1)
      }
    });

    this.setState({ socket: this.socket });
  }
  async componentDidMount() {
    const id = localStorage.getItem('id');
    // const { data } = await axios.get(`http://localhost:3396/api/usersChallenges/${id}`)
    const { data } = await axios.get('http://localhost:3396/api/challenges/getAllChallenges');
    this.setState({
      allChallenges: data.rows,
    });
    this.state.socket.on('server.login', (res) => {
      console.log(res);
      this.setState({
        sharedURL: res.duelURL
      })
    })
  }

  randomSlingId = () => {
    slingId = `${randomstring.generate()}`;
  }

  handleDuelClick = () => {
    this.randomSlingId();
    this.props.history.push({
      pathname: `/${slingId}`,
      state: {
        challenge: this.state.selectedChallenge
      }
    });
  }

  handleAddChallengeClick = () => {
    this.props.history.push('/addChallenge');
  }

  handleChallengeSelect = (e) => {
    e.preventDefault();
    const { value } = e.target;
    this.setState({ selectedChallenge: value });
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  showUserURL = () => {
    const payload = {
      username: this.state.username,
      duelURL: this.state.room
    }
    this.state.socket.emit('client.login', payload)
  }

  render() {
    let join;
    if (this.state.sharedURL !== null) {
      join = <a className='join' href={this.state.sharedURL}>Join Duel:  {this.state.sharedURL}</a>
    }
    return (
      <div className="landing-page-container">
        <Logo
          className="landing-page-logo"
        />
        <br />
        <h5>Challenges</h5>
        <select onChange={(e) => this.handleChallengeSelect(e)}>
          {this.state.allChallenges.map((challenge, i) => {
            return (
              <option
                key={i}
                value={JSON.stringify(challenge)}
              >
                {challenge.title}
              </option>)
          }
          )}
        </select>
        <br />
        <br />
        <Input
          name="room"
          id="urlInput"
          onChange={this.handleChange}
        />
        <br />
        <br />
        <Button
          backgroundColor="red"
          color="white"
          text="Share URL with Users in Room"
          onClick={() => this.showUserURL()}
        />
        <br />
        <Button
          backgroundColor="red"
          color="white"
          text="Create Challenge"
          onClick={() => this.handleAddChallengeClick()}
        />
        <br />
        <Button
          backgroundColor="red"
          color="white"
          text="Play Solo/Get Duel URL to Share"
          onClick={() => this.handleDuelClick()}
        />
        <br />
        {join}
      </div>
    );
  }
}

export default Home;
