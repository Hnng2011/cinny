/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ConfirmDialog.scss';

import ReactStars from "react-rating-stars-component";
import { useAtom } from 'jotai';
import { openReusableDialog } from '../../../client/action/navigation';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';

import { SmartAccountAtom } from '../../state/smartAccount';
import { votingForRoom } from '../../../client/action/room'

function ConfirmDialog({
  desc, actionTitle, actionType, onComplete, isVoting
}) {
  const [rating, setRating] = useState(0)
  const [voting, setVoting] = useState(false)
  const [smartAccount,] = useAtom(SmartAccountAtom)

  const ratingChanged = (newRating) => {
    setRating(newRating)
  };

  const handleVote = async () => {
    setVoting(true)
    const result = await votingForRoom(isVoting[2], isVoting[3], rating, smartAccount)
    onComplete(result)
  }

  return (
    <>
      {!isVoting?.[0] ? (
        <div className="confirm-dialog">
          <Text>{desc}</Text>
          <div className="confirm-dialog__btn">
            <Button variant={actionType} onClick={() => onComplete(true)}>{actionTitle}</Button>
            <Button onClick={() => onComplete(false)}>Cancel</Button>
          </div>
        </div>
      ) : !isVoting?.[1] ? (
        <div className="confirm-dialog">
          <Text>You have already voted</Text>
        </div>
      ) : (
        <div className="confirm-dialog">
          <Text>{desc}</Text>
          <ReactStars
            char='❤'
            value={rating}
            count={5}
            onChange={ratingChanged}
            size={36}
            activeColor="#e31b23"
          />
          <div className="confirm-dialog__btn">
            <Button disabled={!rating || voting} variant={actionType} onClick={() => handleVote()}>{actionTitle}</Button>
            <Button onClick={() => onComplete(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </>
  );
}

ConfirmDialog.propTypes = {
  desc: PropTypes.string.isRequired,
  actionTitle: PropTypes.string.isRequired,
  actionType: PropTypes.oneOf(['primary', 'positive', 'danger', 'caution']).isRequired,
  onComplete: PropTypes.func.isRequired,
  isVoting: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ])).isRequired,
};

/**
 * @param {string} title title of confirm dialog
 * @param {string} desc description of confirm dialog
 * @param {string} actionTitle title of main action to take
 * @param {'primary' | 'positive' | 'danger' | 'caution'} actionType type of action. default=primary
 * @param {boolean} isVoting type of confirm dialog. default=false
 * @return {Promise<boolean>} does it get's confirmed or not
 */
// eslint-disable-next-line import/prefer-default-export
export const confirmDialog = (title, desc, actionTitle, actionType = 'primary', isVoting = [false, false, '', '']) => new Promise((resolve) => {
  let isCompleted = false;
  openReusableDialog(
    <Text variant="s1" weight="medium">{title}</Text>,
    (requestClose) => (
      <ConfirmDialog
        isVoting={isVoting}
        desc={desc}
        actionTitle={actionTitle}
        actionType={actionType}
        onComplete={(isConfirmed) => {
          isCompleted = true;
          resolve(isConfirmed);
          requestClose();
        }}
      />
    ),
    () => {
      if (!isCompleted) resolve(false);
    },
  );
});
