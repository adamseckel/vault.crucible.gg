import React from 'react';
import {Column, Text, animations} from './styleguide';

export default({className, style, onAuthorize, SignInButton}) => {
  return (
    <Column css={`composes: ${animations.fadeInSlow}; position: absolute; top: 60px; bottom: 0; left: 0; right: 0;`}>
      <Text center gray css={`opacity: 0.1; position: absolute; left: 0; right: 0; top: 0; bottom: 0;`} size={'max'}>2</Text>
      <Text title light size={4} css={`composes: ${animations.fadeInSlow}; animation-delay: 500ms; opacity: 0; margin-bottom: 20px;`}>vault.crucible.gg</Text>
      <Text gray size={2} css={`composes: ${animations.fadeInSlow}; animation-delay: 1000ms; opacity: 0; margin-bottom: 20px;`}> Fast, Simple, Gear Management for Destiny 2 </Text>
      <SignInButton css={`composes: ${animations.fadeInSlow}; animation-delay: 1500ms; opacity: 0;`} label='Sign In' onTouchTap={onAuthorize}/>
    </Column>
  );
};