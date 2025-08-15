import React from 'react';
import styled, { keyframes } from 'styled-components';

const dance = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Letter = styled.span`
  font-size: 3rem;
  font-weight: bold;
  color: #3b82f6; /* A nice blue color */
  animation: ${dance} 1.5s infinite;
  /* 1. Use the transient prop '$delay' here */
  animation-delay: ${props => props.$delay};
`;

const LoadingSpinner = () => {
  const text = "JRATS";
  return (
    <SpinnerContainer>
      {text.split('').map((char, index) => (
        /* 2. Pass the prop with a '$' prefix */
        <Letter key={index} $delay={`${index * 0.1}s`}>
          {char}
        </Letter>
      ))}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;